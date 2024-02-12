const {download} = require("../service/service");
const path = require("path");
module.exports = class DownloadController {
    static async download(req,res,next){
        try{
            const url = req.body.url.replace(/-1|-2$/g, '');;
            await download(url);
            res.sendFile(path.join("C:","Users","Dell","download-page","output.pdf"));
        }catch (e) {
            next(e);
        }
    }
}