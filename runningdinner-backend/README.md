## Overview

This module contains the business logic of the runningdinner app based upon Java / Spring Boot.

Furthermore, the current AngularJS webclient is built using Grunt and resides in src/main/client.

**Infrastructure**

The infrastructure folder contains mainly some helper stuff for local development, but also some helper scripts for dpeloyment.

The code for managing the productive infrastructure on AWS can be found here: https://github.com/Clemens85/runningdinner-provisioning.

**Local Development Mail files**

Specify `-DMailMockDir=yourfolder` for getting mail files into a specific folder.
