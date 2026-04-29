const icprXpaths = require('./icpr_xpaths.json');
const traceloXpaths = require('./tracelo_xpaths.json');

function getXpaths() {
    const projectType = (process.env.PROJECT_TYPE || 'icpr').toLowerCase();
    return projectType === 'tracelo' ? traceloXpaths : icprXpaths;

    console.log('use x paths for Project Type:', projectType);
}

module.exports = { getXpaths };
