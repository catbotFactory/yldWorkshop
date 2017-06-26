This repository is for the SPA conference YLD catbot.

Once you build the wooden frame and connected all the wires, clone this repo, or if you have a github account, fork it (using the fork button on this github page) then clone it.

``` git clone https://github.com/catsAndSolenoids/yldWorkshop.git```

or if you forked it 

``` git clone https://github.com/YOUR_USER_NAME/yldWorkshop.git```

then install the dependencies (```--production``` avoid installing dev dependencies)

```npm install --production```

you can now test if the board is ready for the workshop by running 

```npm run firmTest```

then you can run the calibration with 

```npm run cal```

once you are done you can start the workshop exercises, more information [here][1].

you can do the exercises in this reposistory, in the example dir, you have the file 01.js that contain the boilerplate code for the workshopper first exercise.

[1]:http://yld.lesnodebots.eu/catbot/lasercat/
