import cv2 as cv
import numpy as np

resizeValue = 1 #TODO: change to take this can be changed without distorting the undistortion

cap = cv.VideoCapture("http://192.168.0.128:8000/stream.mjpg") #or: highres.mjpg
#cap = cv.VideoCapture(0)

cvFile = cv.FileStorage("calibrationValuesVideo.xml",cv.FILE_STORAGE_READ)
mtx = cvFile.getNode("mtx").mat()
dist = cvFile.getNode("dist").mat()
newCameraMTX = cvFile.getNode("newCameraMTX").mat()
roi = cvFile.getNode("roi").mat()


pause = False
while(cap.isOpened()):
    if(pause == False):
        ret, frame = cap.read()

        imgHeight, imgWidth, layers = frame.shape

        resizeIMG = cv.resize(frame,(int(imgWidth*resizeValue),int(imgHeight*resizeValue)))

        cv.imshow("original", resizeIMG)

        undistortedFrame = cv.undistort(resizeIMG,mtx,dist,None,newCameraMTX)
        cv.imshow("undistorted", undistortedFrame)
        try:                    #TODO VERY unreliable!!!!!!!!!
            #crop
            x,y,w,h = roi
            undistortedFrame = undistortedFrame[y:y+h, x:x+w]
            cv.imshow("undistorted cropped", undistortedFrame)
        except Exception as e:
            print(e)

        #undistortedFrame = cv.undistort(resizeIMG,mtx,dist,None,newCameraMTX)
        #cv.imshow("undistorted", undistortedFrame)

    key = cv.waitKey(1)
    if key & 0xFF == ord('q'):
        break
    elif key & 0xFF == ord(' '):
        pause = not pause
        print("pause " + str(pause))

cap.release()
cv.destroyAllWindows()
