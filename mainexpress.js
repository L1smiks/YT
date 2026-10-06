import express from 'express';
import fs from "fs";
import { Pool } from "pg";
import Busboy from "busboy";
import bcrypt from 'bcrypt';
import crypto from "crypto";
import path from "path";
import cors from 'cors';

const PORT = process.env.PORT || 3777;
const databaseurl = "postgresql://postgres:1234@localhost:5432/youtube";
const pool = new Pool({connectionString:databaseurl});

const app = express(); //application

app.use(cors({origin: 'http://localhost:5173'}));
app.use(express.json());

const dirs = ['upload/videos', 'upload/thumbnails'];
// existsSync проверить
// mkdirsynd создать



app.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));