import React from 'react';

const whyDidYouRender = require('@welldone-software/why-did-you-render');
whyDidYouRender(React);

// import whyDidYouRender from "@welldone-software/why-did-you-render";
//
// whyDidYouRender(React, {
//   onlyLogs: true,
//   titleColor: "green",
//   diffNameColor: "aqua"
// });

// // if (process.env.NODE_ENV === 'development') {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render');
//   whyDidYouRender(React, {
//     trackAllPureComponents: true,
//   });
// // }