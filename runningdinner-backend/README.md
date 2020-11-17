## Overview

This module contains the business logic of the runningdinner app based upon Java / Spring Boot.

Furthermore the current AngularJS webclient is built using Grunt and resides in src/main/client.

**Infrastructure**

The infrastructure folder contains mainly some helper stuff for local development, but also some helper scripts for dpeloyment.

The code for managing the productive infrastructure on AWS can be found here: https://github.com/Clemens85/runningdinner-provisioning.

**Google Maps Key**

The key for google maps integration needs to be passed as parameter to grunt like so:<br>
grunt default --GOOGLE_MAPS_KEY_JS=xxx

Alternatively the environment variable GOOGLE_MAPS_KEY_JS can be set, and a call to ``npm run build`` will just pick it up.

