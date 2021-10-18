(function(angular) {
  'use strict';

  angular.module('rd.frontend.constants').constant('NewsMessages_lang_en', {

    news_title_20211019: 'Excel Export',
    news_content_20211019: 'The participant list was extended by a simple export functionality (Excel)',

    news_title_20201001: 'Bugfix for problem during generating teams',
    news_content_20201001: 'Unfortunately there was a technical error in the Running Dinner tool, which caused sometimes a problem during team generation. ' +
                           'This error is now fixed and furthermore some functions were slighty improved.',

    news_title_20200205: 'Bugfix for problems during registration',
    news_content_20200205: 'Unfortunately there was a technical error in the Running Dinner tool, which caused some problems during registration to dinner events. ' +
                          'This error is now fixed and the registration process works as expected again.',

    news_title_20191011: 'Bugfix for wrong eating habits',
    news_content_20191011: 'There was an error that caused wrong eating habits being shown of some participants on the dinner routes. ' +
        'This error is now fixed and the eating habits (like e.g. vegetarian) are now properly displayed.',

    news_title_20190701: 'Multiple languages',
    news_content_20190701: 'The web application supports now also English language. ' +
        'Thus it is now possible to view the running dinner platform also in English language. Furthermore it is now also possible to ' +
        'create Running Rinner events in English language, which is especially useful in Non-German regions.',

    news_title_20190620: 'News',
    news_content_20190620: 'Now and then, this page will inform you in future about all news and developments of the Running Dinner platform.',

    x: ''
  });

})(angular);
