module.exports = {
    // the express handler implementation for ping
    get_ping: (req, res) => res.status(200).send('get pong'),
    post_ping: (req, res) => res.status(200).send('post pong'),
};