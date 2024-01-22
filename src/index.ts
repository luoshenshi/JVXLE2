import express, { Express, Response, Request } from "express";
import ytdl from "ytdl-core";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";

const app: Express = express();
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let filter_URL: string;
let videoTitle: string;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "public"));

app.get("/", (req: Request, res: Response) => {
  res.render("index");
});

app.post("/filter", async (req: Request, res: Response) => {
  if (req.body.url == "") {
    res.render("badrequest");
  } else {
    filter_URL = req.body.url;
    const info = await ytdl.getInfo(req.body.url);
    const thumbnail: string =
      info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
    videoTitle = info.videoDetails.title;

    res.render("download", {
      thumbnail: thumbnail,
      videoTitle: videoTitle,
    });
  }
});

app.post("/download", async (req: Request, res: Response) => {
  try {
    const info = await ytdl.getInfo(filter_URL);
    const format = ytdl.chooseFormat(info.formats, { quality: "highest" });
    const outputFilePath = path.join(
      __dirname,
      "..",
      "temp",
      `video.${format.container}`
    );

    ytdl(filter_URL, {
      filter: (format) => {
        return (
          format.codecs.includes("avc1.42001E") &&
          format.codecs.includes("mp4a.40.2")
        );
      },
    })
      .pipe(fs.createWriteStream(outputFilePath))
      .on("finish", async () => {
        console.log(
          `Video downloaded successfully to the temporary folder in ${format.container} format`
        );

        const execPromisified = util.promisify(exec);
        await execPromisified(
          `ffmpeg -i "${path.join(
            __dirname,
            "..",
            "temp",
            `video.${format.container}`
          )}" "${path.join(
            __dirname,
            "..",
            "out",
            `${videoTitle}.${req.body.ff_gformat}`
          )}" -y`
        );

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="jvxle.onrender.com - ${encodeURIComponent(
            videoTitle
          )}.${req.body.ff_gformat}"`
        );
        fs.createReadStream(
          path.join(
            __dirname,
            "..",
            "out",
            `${videoTitle}.${req.body.ff_gformat}`
          )
        )
          .pipe(res)
          .on("finish", () => {
            fs.unlinkSync(
              path.join(
                __dirname,
                "..",
                "out",
                `${videoTitle}.${req.body.ff_gformat}`
              )
            );
            fs.unlinkSync(
              path.join(__dirname, "..", "temp", `video.${format.container}`)
            );
          });
      })
      .on("error", (err) => {
        console.error("Error:", err);
      });
  } catch (err) {
    console.error("Error:", err);
  }
});

app.listen(3000, () => {
  console.log("Ay ay Captain");
});
