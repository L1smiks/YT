import {createServer} from "http";
import { Pool } from "pg";
import bcrypt from 'bcrypt';
import Busboy from "busboy";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const PORT = 3777;
const databaseurl = "postgresql://postgres:1234@localhost:5432/youtube";
const pool = new Pool({connectionString:databaseurl});
pool.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
.then (() => console.log("Расширение добавлено"))
.catch ((error) => console.error(error));
const videodir = "upload/videos";
const thumbdir = "upload/thumbnails";
if (!fs.existsSync(videodir)) {
    fs.mkdirSync(videodir,{recursive:true})
}
if (!fs.existsSync(thumbdir)) {
    fs.mkdirSync(thumbdir,{recursive:true})
}
async function ListPublicVideos(limit = 12, offset = 0) {
    const {rows} = await pool.query(
        `
        SELECT v.*, u.username AS owner_username
        FROM app.videos v
        JOIN app.users u ON u.id = v.ownerid
        ORDER BY v.create_at DESC
        LIMIT $1 OFFSET $2
        `,
        [limit,offset]
    );
    return rows;
}
const uploadir = 'upload/videos';
if (!fs.existsSync(uploadir)) {
    fs.mkdirSync(uploadir,{recursive:true});
}
function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin','http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers','Content-type');
}
async function janres(res) {
    let chanelID;
    const query = 
    `
    SELECT category FROM app.videos WHERE ownerid = $1
    `
    const values = [chanelID];
    const result = await pool.query(query,values);
    const query1 = 
    `
    SELECT likes,dislikes,comments,followers,views FROM app.users WHERE id = $1
    `
    const values1 = [chanelID];
    const result1 = await pool.query(query1,values1);
}
const server = createServer(async (req,res)=> {
    setCors(res);
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }
    if (req.url.startsWith("/videos")) {
        const url = new URL(req.url,`http://${req.headers.host}`);
        const limit = parseInt(url.searchParams.get('limit') || '12');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        try {
            const videos = await ListPublicVideos(limit,offset);
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(videos));
        }
        catch (err) {
            res.writeHead(500,{'Content-Type':'application/json'});
            res.end(JSON.stringify({error:err.message}));
        }
    }
    else if (req.url.startsWith("/regist")) {
        let body = '';
        req.on('data', chunck => {
            body += chunck.toString();
        });

        req.on('end', async () => {
            const {login,password,email} = JSON.parse(body);
            if (!login || !password || !email) {
                res.writeHead(400,{'Content-Type':'application/json'});
                res.end(JSON.stringify({error:err.message}));
            }
            const newuser = await registUser(login,password,email);
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify({newuser}));
        });
    }
    else if (req.url.startsWith("/login")) {  
        let body = '';
        req.on('data', chunck => {
            body += chunck.toString();
        });
        req.on('end', async () => {
            const {login,password} = JSON.parse(body);
            const querytext = `
            SELECT * FROM app.users
            WHERE username = $1;
            `;
            const value = [login];
            const {rows} = await pool.query(querytext,value);
            if (rows.length == 0) {
                console.log('error');
                return;
            }
            const user = rows[0];
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify({user}));
        })
    }
    else if (req.url.startsWith("/api/videos/upload") && req.method === 'POST') {
        const busboy = Busboy({headers: req.headers})
        let videoMimeType = '';
        let title = '';
        let category = '';
        let videoPath = "";
        let thumbPath = "";
        const uploadPromises = [];
        let ownerID = '';
        let thumbNailMime = '';
        let description = '';
        busboy.on('file', (fieldName,file,info) => {
            const {mimeType,filename} = info;
            const originalName = crypto.randomUUID() + path.extname(filename);
            const promise = new Promise((resolve,reject) => {
                let saveTo = "";
                if (fieldName === "video") {
                    saveTo = path.join(videodir,originalName);
                    videoPath = saveTo;
                    videoMimeType = mimeType;
                }
                else if (fieldName === "thumbnail") {
                    saveTo = path.join(thumbdir,originalName);
                    thumbPath = saveTo;
                    thumbNailMime = mimeType;
                }
                else {
                    file.resume();
                    return reject();
                }
                const writebleStream = fs.createWriteStream(saveTo);
                file.pipe(writebleStream);

                file.on('end', () => {
                    console.log("Файл:  ",fieldName,"Путь: ", saveTo);
                });

                writebleStream.on('finish', resolve);
                writebleStream.on('error', reject);
            });
            uploadPromises.push(promise);
        });
        busboy.on('field', (fieldName,value) => {
            if (fieldName === 'name') {
                title = value;
            }

            if (fieldName === 'ownerid') {
                ownerID = value;
            }

            if (fieldName === 'category') {
                category = value;
            }

            if (fieldName === 'description') {
                description = value;
            }
        });
        busboy.on('finish', async () => {
            console.log("Result: ", category);
            await Promise.all(uploadPromises);
            if (!ownerID || ownerID.trim() === "") {
                res.writeHead(400,{'Content-Type' : 'application/json'})
                return res.end(JSON.stringify({error: "ownerID is required"}))
            }
            try {
                const query = 
                    `
                    INSERT INTO app.videos (title,ownerid,thumbnail_path,thumbnail_mime,video_path,mime_type,category,description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id,title,ownerid
                    `;
                    
                const values = [title,ownerID,thumbPath,thumbNailMime,videoPath,videoMimeType,category,description];
                const result = await pool.query(query,values);
                res.writeHead(200,{"Content-Type" : "application/json"});
                res.end(JSON.stringify({message: 'Видео получено', video: result.rows[0].id}));
            }
            catch (err) {
                console.error(err);
                res.writeHead(500,{'Content-Type' : 'application/json'});
                res.end(JSON.stringify({error: 'Ошибка сервера'}));
            }
        });

        req.pipe(busboy);
        return;
    }
    else if (req.url.startsWith("/api/comments/upload") && req.method === 'POST') {
        const urlParts = req.url.split("/");
        const videoID = urlParts[urlParts.length - 1];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        })
        req.on('end', async () => {
            const parsedBody = JSON.parse(body);
            let content = parsedBody.content;
            let autor = parsedBody.autor;
            let video = parsedBody.video;
            let author_name = parsedBody.author_name;
            try {
                const query2 = 
                `
                UPDATE app.videos
                SET comments = comments + 1
                WHERE id=$1
                RETURNING views, comments;
                `
                const values2 = [videoID];
                const result2 = await pool.query(query2,values2);
                const query =
                `
                INSERT INTO app.comments (content,autor,author_name,video) VALUES ($1, $2, $3, $4) RETURNING id;
                `
                const values = [content,autor,author_name,video];
                const result = await pool.query(query,values);
                res.writeHead(200,{'Content-Type' : 'application/json'});
                res.end(JSON.stringify({message: 'Комментарий получено', comment: result.rows[0].id}));
            }
            catch (err) {
                console.error(err);
                res.writeHead(500,{'Content-Type' : 'application/json'});
                res.end(JSON.stringify({error: 'Ошибка сервера'}));
            }
        })
    }
    else if (req.url.startsWith("/api/listcomments") && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const videoID = urlParts[urlParts.length - 1];
        try {
            const query = 
            `
            SELECT content, author_name, id FROM app.comments WHERE video=$1
            `
            const values = [videoID];
            const result = await pool.query(query,values);
            const commentsWithLinks = result.rows.map((comments) => ({
            content: comments.content,
            author_name: comments.author_name,
            id: comments.id
            }))
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(commentsWithLinks));
        }
        catch (err) {
            console.error(error);
            res.writeHead(500,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({error: 'Not Found'}));
        }
    }
    else if (req.url.startsWith("/api/listoperations") && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const valueURL = urlParts[urlParts.length - 2];
        const ownerID = urlParts[urlParts.length - 1];
        try {
            const query1 = 
            `
            UPDATE app.videos
            SET views = views + 1
            WHERE id=$1
            RETURNING views, likes;
            `
            const values1 = [valueURL];
            const result = await pool.query(query1,values1);
            const oprationsWithLinks = result.rows.map((operations) => ({
            views: operations.views,
            likes: operations.likes,
            id: valueURL
            }));
            const query2 = 
            `
            UPDATE app.users
            SET views = array_append(views,$1)
            WHERE id=$2
            RETURNING views, likes;
            `
            const values2 = [valueURL, ownerID];
            const result1 = await pool.query(query2,values2);
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(oprationsWithLinks));
        }
        catch (err) {
            console.error(err);
            res.writeHead(500,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({err: 'Not Found'}));
        }
    }
    else if (req.url.startsWith("/api/dislike") && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const videoID = urlParts[urlParts.length - 2];
        const ownerID = urlParts[urlParts.length - 1];
        try {
            const query = 
            `
            UPDATE app.users
            SET dislikes = array_append(dislikes,$1)
            WHERE id=$2
            RETURNING views, dislikes;
            `
            const values = [videoID, ownerID];
            const result = await pool.query(query,values);
            const query2 = 
            `
            UPDATE app.videos
            SET dislikes = dislikes + 1
            WHERE id=$1
            RETURNING views, dislikes;
            `
            const values2 = [videoID];
            const result1 = await pool.query(query2,values2);
            const oprationsWithLinks = result1.rows.map((operations) => ({
            views: operations.views,
            dislikes: operations.dislikes,
            id: videoID
            }));
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(oprationsWithLinks));
        }
        catch (err) {
            console.error(err);
            res.writeHead(500,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({err: 'Not Found'}));
        }
    }
    else if (req.url.startsWith("/api/subscribe") && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const ownerID = urlParts[urlParts.length - 2];
        const chanelID = urlParts[urlParts.length - 1];
        try {
            const query1 = 
            `
            UPDATE app.users
            SET followers = followers + 1
            WHERE id=$1
            RETURNING followers, follow;
            `
            const values1 = [chanelID];
            const result1 = await pool.query(query1,values1);
            const query = 
            `
            UPDATE app.users
            SET follow = array_append(follow,$2)
            WHERE id=$1
            RETURNING follow, followers;
            `
            const values = [ownerID, chanelID];
            const result = await pool.query(query,values);
            const oprationsWithLinks = result.rows.map((operations) => ({
            follow: operations.follow,
            id: ownerID
            }));
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(oprationsWithLinks));
        }
        catch (err) {
            console.log(err);
            res.writeHead(500,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({err: 'Not Found'}));
        }
    }
    else if (req.url.startsWith("/api/usid") && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const videoID = urlParts[urlParts.length - 1];
        try {
            const query = 
            `
            SELECT ownerid, id FROM app.videos WHERE id=$1
            `
            const values = [videoID];
            const result = await pool.query(query,values);
            const oprationsWithLinks = result.rows.map((operations) => ({
            ownerid: operations.ownerid,
            id: videoID,
            id2: operations.id
            }));
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(oprationsWithLinks));
        }
        catch (err) {
            console.log(err);
            res.writeHead(500,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({err: 'Not Found'}));
        }
    }
    else if (req.url.startsWith("/api/userlike") && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const videoID = urlParts[urlParts.length - 2];
        const ownerID = urlParts[urlParts.length - 1];
        try {
            const query = 
            `
            UPDATE app.users
            SET likes = array_append(likes,$1)
            WHERE id=$2
            RETURNING views, likes;
            `
            const values = [videoID, ownerID];
            const result = await pool.query(query,values);
            const query2 = 
            `
            UPDATE app.videos
            SET likes = likes + 1
            WHERE id=$1
            RETURNING views, likes;
            `
            const values2 = [videoID];
            const result1 = await pool.query(query2,values2);
            const oprationsWithLinks = result1.rows.map((operations) => ({
            views: operations.views,
            likes: operations.likes,
            id: videoID
            }));
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(oprationsWithLinks));
        }
        catch (err) {
            console.error(err);
            res.writeHead(500,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({err: 'Not Found'}));
        }
    }
    else if (req.url.startsWith("/api/search") && req.method === 'GET') {
        const urlObject = new URL(req.url,`http://${req.headers.host}`);
        const searchquery = urlObject.searchParams.get("q");
        if (!searchquery) {
            res.writeHead(400,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({error: 'Ошибка сервера'}));
        }
        try {
            const query = `
                SELECT id,title,ownerid,description FROM app.videos
                WHERE
                    title ILIKE $2 OR
                    description ILIKE $2 OR
                    similarity(title, $1::text) > 0.05 OR
                    similarity(description, $1::text) > 0.05
                ORDER BY greatest(similarity(title, $1::text), similarity(description, $1::text)) DESC
                LIMIT 20;
            `
            const values = [searchquery, `%${searchquery}%`];
            const result = await pool.query(query,values);
            const searchWithLinks = result.rows.map((search) => ({
                id: search.id,
                title: search.title,
                ownerid: search.ownerid,
                thumbnailURL: `http://localhost:3777/api/video/thumbnail/${search.id}`,
                description: search.description
            }))
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(searchWithLinks));
        }
        catch (error) {
            console.error("ОШИБКА ТУТ:", error);
            res.writeHead(500,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({error: 'Ошибка сервера'}));
        }
        return;
    }
    /*else if (req.url.startsWith('/videos') && req.method === 'GET') {
        const filePath = path.join("upload/videos", req.url.replace('/videos/',''));
        if (fs.existsSync(filePath)) {
            const fileStream = fs.createReadStream(filePath);
            res.writeHead(200,{'Content-Type' : 'video/mp4'})
            fileStream.pipe(res);
        } else {
            res.writeHead(400);
            res.end('Not found');
        }
        return;
    }
    else if (req.url.startsWith('/takevideos') && req.method === 'GET') {
        const result = await pool.query(`SELECT * FROM app.videos ORDER BY RANDOM() LIMIT 1`)
        if (result.rows.length > 0) {
            const video = result.rows[0];
            res.writeHead(200,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify(video));
        }
        else {
            console.log('Ошибка загрузки видео')
        }
    }*/
    else if (req.url.startsWith('/api/video/thumbnail/') && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const thumbnailID = urlParts[urlParts.length - 1];

        if (!thumbnailID) {
            res.writeHead(400);
            res.end('ID не найдено');
            return;
        }
        try {
            const query = 
            `
                SELECT thumbnail_path , thumbnail_mime FROM app.videos WHERE id=$1
            `;
            const result = await pool.query(query,[thumbnailID]);
            if (result.rows.length === 0) {
                res.writeHead(404);
                res.end('Картинка не найдена');
                return;
            }

            const thumbnailRow = result.rows[0];

            if (!thumbnailRow.thumbnail_path) {
                res.writeHead(404);
                res.end('Картинка не найдена');
                return;
            }
            const thumbnailBuffer = thumbnailRow.thumbnail_path;

            res.writeHead(200,{
                "Content-Type":thumbnailRow.thumbnail_mime || "image/jpeg",
                "Content-Length": fs.statSync(thumbnailBuffer).size,
            });
            const readStream = fs.createReadStream(thumbnailBuffer);
            readStream.pipe(res);
        }
        catch {
            res.writeHead(500,{'Content-Type' : 'application/json'});
            res.end(JSON.stringify({error: 'Ошибка сервера'}));
        }
    }
    else if (req.url.startsWith('/api/video/') && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const videoID = urlParts[urlParts.length - 1];
 
        try {
            const query = `SELECT video_path, mime_type FROM app.videos WHERE id=$1`;
            const result = await pool.query(query, [videoID]);
            
            if (result.rows.length === 0) {
                res.writeHead(404);
                return res.end('Not found');
            }

            const {video_path, mime_type} = result.rows[0];

            res.writeHead(200,{
                "Content-Type": mime_type || "video/mp4",
                "Content-Length": fs.statSync(video_path).size,
            });
            const readStream = fs.createReadStream(video_path);
            readStream.pipe(res);

        } catch (err) {
            console.error(err);
            res.writeHead(500);
            res.end('Server Error');
        }
        return;
    }
    else if (req.url.startsWith('/api/description/') && req.method === 'GET') {
        const urlParts = req.url.split("/");
        const videoID = urlParts[urlParts.length - 1];

        try {
            const query = `SELECT description FROM app.videos WHERE id=$1`;
            const result = await pool.query(query, [videoID]);
            
            if (result.rows.length === 0) {
                res.writeHead(404);
                return res.end('Not found');
            }

            const description = result.rows[0];

            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(description));

        } catch (err) {
            console.error(err);
            res.writeHead(500);
            res.end('Server Error');
        }
        return;
    }
    else if (req.url.startsWith('/api/listvideo') && req.method === 'GET') {
        const urlObject = new URL(req.url,`http://${req.headers.host}`);
        const limit = parseInt(urlObject.searchParams.get("limit"));
        const category = urlObject.searchParams.get("category");
        let query = ``;
        let result;
        if (!category) {
            query = `SELECT id,title,ownerid,description,views FROM app.videos ORDER BY RANDOM() LIMIT $1`;
            result = await pool.query(query,[limit]);
        }
        else {
            query = `SELECT id,title,ownerid,description FROM app.videos WHERE category=$1`
            result = await pool.query(query,[category]);
        }
        if (result.rows.length === 0) {                                                                 
            res.writeHead(404);
            res.end('Видео не найдены');
            return;
        }
        const videosWithLinks = result.rows.map((video) => ({
            id: video.id,
            title: video.title,
            ownerid: video.ownerid,
            thumbnailURL: `http://localhost:3777/api/video/thumbnail/${video.id}`,
            description: video.description,
            views: video.views
        }))
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(videosWithLinks));
    }
    else {
        res.writeHead(404,{'Content-Type':'application/json'});
        res.end(JSON.stringify({error:"Not Found"}));
    }
});
async function registUser(login,password,email) {
    
    const hashedpassword = await bcrypt.hash(password,10);
    const querytext = `
    INSERT INTO app.users (username,password_hash,email)
    VALUES ($1 , $2 , $3)
    RETURNING id , username , email, create_add
    `
    const values = [login,hashedpassword,email];
    const {rows} = await pool.query(querytext,values);
    return rows[0];
}

server.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));





/*const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,"uploads/videos")
    },
    filename: (req,file,cb) => {
        cb(null,Date.now() + path.axtname(file.originalname))
    }
});
const upload = multer({storage}); */