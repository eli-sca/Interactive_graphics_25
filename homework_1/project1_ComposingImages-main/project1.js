// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    var fgHeight = fgImg.height;
    var fgWidth = fgImg.width;
    var bgHeight = bgImg.height;
    var bgWidth = bgImg.width;

    var bgPix = bgImg.data;
    var fgPix = fgImg.data;

    var offset = fgPos.y * bgWidth + fgPos.x; // Offset due to fgPos.

    for (var row = 0, n = fgHeight; row < n ; row += 1) {
        for (var col = 0, m = fgWidth; col < m; col += 1) {

            // Check if foreground is out of background img.
            if(row+fgPos.y<bgHeight && row+fgPos.y>=0 && col+fgPos.x<bgWidth && col+fgPos.x>=0){
                
                fgIndexPix = (row * fgWidth + col)*4;               // Desired pixel of foreground.
                bgIndexPix =  ( offset + row * bgWidth + col)*4;    // Desired pixel of background.

                fgAlpha = fgPix[fgIndexPix + 3]/255 * fgOpac;       // alpha of foreground in range [0,1], rescaled with fgOpac.
                bgAlpha = bgPix[bgIndexPix + 3]/255;                // alpha of background in range [0,1].
                alpha   = fgAlpha + (1-fgAlpha) * bgAlpha;          // alpha used in alpha blending.

                for(var channelIdx = 0; channelIdx<3; channelIdx++){
                    bgPix[bgIndexPix + channelIdx]   = (fgAlpha * fgPix[fgIndexPix + channelIdx] + (1-fgAlpha) * bgAlpha * bgPix[bgIndexPix + channelIdx]) / alpha;  
                }
                bgPix[bgIndexPix + 3] = alpha*255;
            }
        }
    }
}
