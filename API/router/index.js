const SiteRouter= require('./site.router')
const UserRouter = require('./user.router')

function route(app) {
    app.use('/', SiteRouter)
}