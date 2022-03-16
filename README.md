runyourdinner
=============
**<< English >>**

Web application for creating and managing own running dinner events.
The fully functional working application can be found here:
<a href="https://runyourdinner.eu" target="_blank">https://runyourdinner.eu</a>

Feature overview can be found here:
<a href="https://runyourdinner.eu/create-running-dinner/" target="_blank">https://runyourdinner.eu/create-running-dinner/</a>

**<< German >>**

Programm bzw. Web-Anwendung um selbstständig ein eigenes Running Dinner zu berechnen, zu  organisieren und durchzuführen. 
Voll funktionsfähige Anwendung unter folgender URL:
<a href="https://runyourdinner.eu" target="_blank">https://runyourdinner.eu</a>

Überblick über alle Features:
<a href="https://runyourdinner.eu/create-running-dinner/" target="_blank">https://runyourdinner.eu/create-running-dinner/</a>

## Overview
* runningdinner-backend contains the backend Java application based upon Spring Boot. 
The AngularJS web-client is also contained in here, and is bundled as static resources (will be replaced by the new React client when the port to React is finished)
* runningdinner-functions contains a lambda function based upon the serverless framework for geocoding addresses.
* runningdinner-webclient is a complete rewrite of the "old" AngularJS code into React (WIP).

## Build
Currently the software is built on a local Jenkins but is in a migration process to CircleCI.

## Author
**Clemens Stich**
+ runyourdinner at gmail.com

## Support 

Thanks to JetBrains for giving a <a href="https://www.jetbrains.com/community/opensource/#support" target="_blank">free</a> ultimate IntellIJ license for this project. 