const icprXpaths = require('./icpr_xpaths.json');
const traceloXpaths = require('./tracelo_xpaths.json');

function getXpaths() {
    const projectType = (process.env.PROJECT_TYPE || 'icpr').toLowerCase();
    return projectType === 'tracelo' ? traceloXpaths : icprXpaths;
}

module.exports = { getXpaths };
