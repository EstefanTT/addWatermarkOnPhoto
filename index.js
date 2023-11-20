const Jimp = require('jimp');
const webp = require('webp-converter');

const path = require('path');
const { readdirSync, existsSync, mkdirSync } = require('fs')


//###########################################################################################################################################
//####################################################      INSTRUCTIONS      ###############################################################
//###########################################################################################################################################

//###########################################################################################################################################
//######################################################      VARIABLES      ################################################################
//###########################################################################################################################################

// appRoot = __dirname.split('addWatermarkOnPhoto')[0] + 'addWatermarkOnPhoto'

const settings = require('./settings.json')

const directoriesPathToCreate = [
    './photosWithoutWatermark/',
    './photosWithWatermark/',
]

const format = process.argv[2]

//###########################################################################################################################################
//######################################################      FUNCTIONS      ################################################################
//###########################################################################################################################################

async function convertWebPToPNG(filePath) {
    const outputFilePath = filePath.replace('.webp', '.png');
    await webp.dwebp(filePath, outputFilePath, "-o");
    return outputFilePath;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function addWatermarkToImage(fileName, format) {
    try {

        let imagePath = `./photosWithoutWatermark/${fileName}`;
        const fileExtension = path.extname(imagePath).toLowerCase();

        // Check if the image is a WebP file and convert it if necessary
        if (fileExtension === '.webp') {
            imagePath = await convertWebPToPNG(imagePath);
            fileName = path.basename(imagePath); // Update fileName with new extension
        }

        // Load the watermark and the target image
        const watermark = await Jimp.read('./media/copperPlate.png');
        const image = await Jimp.read(imagePath);

        // Resize the watermark
        const watermark_newWidth = Math.round(image.bitmap.width * (settings.copperPlatePercentageOfImageWidth / 100));
        const aspectRatio = watermark.bitmap.width / watermark.bitmap.height;
        const watermark_newHeight = Math.round(watermark_newWidth / aspectRatio);

        watermark.resize(watermark_newWidth, watermark_newHeight);

        // Calculate position for watermark (bottom right with 20px margin)
        let x, y
        if (format === 'website') {
            x = image.bitmap.width - watermark.bitmap.width - settings.marginRight;
            y = image.bitmap.height - watermark.bitmap.height - settings.marginBottom;
        } else if (format === 'instagram') {
            x = Math.round((image.bitmap.width / 2) - (watermark_newWidth / 2))
            y = image.bitmap.height - watermark.bitmap.height - settings.marginBottom - settings.extraBottomOnInstagram;
        }

        // Composite the watermark onto the target image
        image.composite(watermark, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1.0,
            opacityDest: 1.0
        });

        // Remove the space in the filenames
        fileName = fileName.replaceAll(' ', '_')

        // Save the image with watermark
        if (format === 'website') {
            await image.writeAsync(`./photosWithWatermark/${fileName}`);
        } else if (format === 'instagram') {
            fileName = fileName.split('.')[0] + '_instagram.' + fileName.split('.')[1]
            await image.writeAsync(`./photosWithWatermark/${fileName}`);
        }

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createAllNonGitTrackedDirectories(directoriesPathToCreate) {

    directoriesPathToCreate.forEach(directoryPathToCreate => {
        if (!existsSync(directoryPathToCreate)) {
            mkdirSync(directoryPathToCreate)
        }
    })
}

//###########################################################################################################################################
//########################################################      Launch      #################################################################
//###########################################################################################################################################

// Example of iterating over filenames (replace with your actual filenames)
// const fileNames = ['image1.jpg', 'image2.png']; // Replace with your actual file names array
// fileNames.forEach(fileName => addWatermarkToImage(fileName));

async function launch() {

    createAllNonGitTrackedDirectories(directoriesPathToCreate)

    // Warning
    if (format !== 'website' && format !== 'instagram') {
        console.log("The command you enter is not valid, is 'website' or 'instagram' written correctly ?")
        return
    }

    const files = readdirSync('./photosWithoutWatermark')

    for (const fileName of files) {
        await addWatermarkToImage(fileName, format);
    }

    // files.forEach(fileName => {
    //     addWatermarkToImage(fileName, format)
    // })

    console.log("Operation finished, your photos should be in the 'photosWithWatermark' directory.")
}

launch()


/*###########################################################################################################################################
//################################################       NOTES, OBJECTS & JSON       ########################################################
//###########################################################################################################################################



//###########################################################################################################################################
//#####################################################       END       #####################################################################
//#########################################################################################################################################*/

