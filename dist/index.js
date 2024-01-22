"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
let filter_URL;
let videoTitle;
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "..", "public"));
app.get("/", (req, res) => {
    res.render("index");
});
app.post("/filter", async (req, res) => {
    if (req.body.url == "") {
        res.render("badrequest");
    }
    else {
        filter_URL = req.body.url;
        const info = await ytdl_core_1.default.getInfo(req.body.url);
        const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
        videoTitle = info.videoDetails.title;
        res.render("download", {
            thumbnail: thumbnail,
            videoTitle: videoTitle,
        });
    }
});
app.post("/download", async (req, res) => {
    try {
        const info = await ytdl_core_1.default.getInfo(filter_URL);
        const format = ytdl_core_1.default.chooseFormat(info.formats, { quality: "highest" });
        const outputFilePath = path_1.default.join(__dirname, "..", "temp", `video.${format.container}`);
        (0, ytdl_core_1.default)(filter_URL, {
            filter: (format) => {
                return (format.codecs.includes("avc1.42001E") &&
                    format.codecs.includes("mp4a.40.2"));
            },
        })
            .pipe(fs_1.default.createWriteStream(outputFilePath))
            .on("finish", async () => {
            console.log(`Video downloaded successfully to the temporary folder in ${format.container} format`);
            const execPromisified = util_1.default.promisify(child_process_1.exec);
            await execPromisified(`ffmpeg -i "${path_1.default.join(__dirname, "..", "temp", `video.${format.container}`)}" "${path_1.default.join(__dirname, "..", "out", `${videoTitle}.${req.body.ff_gformat}`)}" -y`);
            res.setHeader("Content-Disposition", `attachment; filename="jvxle.onrender.com - ${encodeURIComponent(videoTitle)}.${req.body.ff_gformat}"`);
            fs_1.default.createReadStream(path_1.default.join(__dirname, "..", "out", `${videoTitle}.${req.body.ff_gformat}`))
                .pipe(res)
                .on("finish", () => {
                fs_1.default.unlinkSync(path_1.default.join(__dirname, "..", "out", `${videoTitle}.${req.body.ff_gformat}`));
                fs_1.default.unlinkSync(path_1.default.join(__dirname, "..", "temp", `video.${format.container}`));
            });
        })
            .on("error", (err) => {
            console.error("Error:", err);
        });
    }
    catch (err) {
        console.error("Error:", err);
    }
});
app.listen(3000, () => {
    console.log("Ay ay Captain");
});
//# sourceMappingURL=index.js.map