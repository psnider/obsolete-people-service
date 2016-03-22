/// <reference path='seneca.d.ts' />
/// <reference path='../express/express.d.ts' />
/// <reference path='../assert/assert.d.ts' />

/*
* This file contains all of the example code that was on http://senecajs.org/get-started as of Mon Mar 21, 2016.
*/


import assert = require('assert')
import SENECA = require('seneca')
var seneca: SENECA.Seneca = SENECA()

seneca.add({ role:'user', cmd:'login' }, function (args, callback) {
  callback(null, { loggedIn:true })
})
seneca.listen()


var client = seneca.client()
client.act({ role:'user', cmd:'login' }, function (err, result) {
  console.log(result.loggedIn)
})


seneca.add({role: 'math', cmd: 'sum'}, function (msg, respond) {
  var sum = msg.left + msg.right
  respond(null, {answer: sum})
})


seneca.act({role: 'math', cmd: 'sum', left: 1, right: 2}, function (err, result) {
  if (err) return console.error(err)
  console.log(result)
})


function minimal_plugin(options: any) {
  console.log(options)
}

seneca.use(minimal_plugin, {foo: 'bar'})


client.act('role:math,cmd:sum,left:1,right:2',console.log)


seneca.use('api')
      .client({ type:'tcp', pin:'role:math' })

var app = require('express')()
      .use(require('body-parser').json())
      .use(seneca.export('web'))
      .listen(3000)



var product = seneca.make('product')
product['name'] = 'Apple'
product['price'] = 1.99

product.save$(console.log)

seneca.use('shop')
      .client({port:9003,pin:'role:shop,info:purchase'})
      .error(assert.fail)

seneca
  .use('shop')
  .listen({ port:9002, pin:'role:shop' })
  .client({ port:9003, pin:'role:shop,info:purchase' })
