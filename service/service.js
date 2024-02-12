const puppeteer = require("puppeteer");
const {PDFDocument, rgb} = require('pdf-lib');
const fs = require('fs');

//module.exports = class DownloadService {
async function download(url) {
    const browser = await puppeteer.launch();
    let working = true;
    let pageNumber = 1;
    const pdfs = [];
    const page = await browser.newPage();
    //body > div > div > div:nth-child(2) > div > div > div.notion-frame > div > main > h1
    while (working) {
        await page.goto(`${url}-${pageNumber}`);
        const imgElement = await page.$('img');
        if (imgElement) {
            await page.waitForSelector('img', {visible: true});
        }
        const titleElement = await page.$("h1.notion-title");

        if(titleElement){
            await page.$eval("h1.notion-title", (element, newContent) => {
                element.innerHTML = newContent +". "+element.innerHTML;
            }, pageNumber);
        }
        const notFound =await page.$('body > div > div');
        console.log(notFound);

        working =  await page.$eval('div > div',(element,newContent)=>{
            if(element.innerHTML === 'Not found' ) {
                console.log({notFound: element.innerHTML})
                return false;
            }
            return true;
        })
        if (!working) {
            console.log({working});
            working = false;
            break;
        }
        await page.evaluate(() => {
            const elementsToDelete = document.querySelectorAll('body > div > div > div.flex.flex-col.items-center.justify-between');
            elementsToDelete.forEach(element => {
                element.remove();
            });
        });

        await page.evaluate(() => {
            window.print();
        });
        const buffer = await page.pdf()
        pdfs.push(buffer);
        pageNumber++;
    }
    const mergedPdfDoc = await PDFDocument.create();

    for (const pdfBuffer of pdfs) {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => {
            mergedPdfDoc.addPage(page);
        });
    }
    const mergedPdfBytes = await mergedPdfDoc.save();
    // const pdfBuffer = await page.pdf();
    const fs = require('fs');
    fs.writeFileSync('output.pdf', mergedPdfBytes);

    await browser.close();
}

module.exports = {
    download
}

// download("https://projects.100xdevs.com/tracks/eooSv7lnuwBO6wl9YA5w/serverless").then(() => {
//     console.log("completed")
// });