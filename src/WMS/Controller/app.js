const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Joi = require('joi');
const { getAllWarehouse } = require('../../Repository/MySqlRepo');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(path.join(__dirname, 'views')));
// app.use('/views', express.static(path.join(__dirname, '')));

app.use(express.static(path.join(__dirname, '/views')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/', require('./routes/auth'));
app.use('/protected', require('./routes/protected'));

//
// const fake_invent = [
// 	{
// 		warehouse: {
// 			id: 1,
// 			name: 'a1',
// 			address: '1',
// 			volume: '15000',
// 			fillVolume: '100000',
// 		},
// 		inventory: [
// 			{
// 				name: 'egg',
// 				category: 'food',
// 				size: '0.1 x 0.1',
// 				quantity: '10000',
// 			},
// 			{`
// 				name: 'mouse',
// 				category: 'electronic',
// 				size: '0.01 x 0.01',
// 				quantity: '5000',
// 			},
// 		],
// 	},
// ];
//
// 	{
// 		warehouse: {
// 			id: 2,
// 			name: 'b2',
// 			address: '2',
// 			volume: '20000',
// 			fillVolume: '500000',
// 		},
// 		inventory: [
// 			{
// 				name: 'phone',
// 				category: 'electronic',
// 				size: '0.15 x 0.50',
// 				quantity: '12000',
// 			},
// 			{
// 				name: 'hat',
// 				category: 'clothing',
// 				size: '0.1 x 0.1 x 0.5',
// 				quantity: '8000',
// 			},
// 		],
// 	},
// ];
//
// const fake_wh = [
// 	{
// 		id: 1,
// 		name: 'a1',
// 		address: '1',
// 		city: 'a',
// 		province: 'A',
// 		volume: '1000',
// 	},
// 	{
// 		id: 2,
// 		name: 'b2',
// 		address: '2',
// 		city: 'b',
// 		province: 'B',
// 		volume: '2000',
// 	},
// 	{
// 		id: 3,
// 		name: 'c3',
// 		address: '3',
// 		city: 'c',
// 		province: 'C',
// 		volume: '3000',
// 	},
// ];
//
// app.post('/', (req, res) => {
// 	console.log(req.body);
// 	const schema = Joi.object().keys({
// 		name: Joi.string().trim().required(),
// 		address: Joi.string().trim().required(),
// 		city: Joi.string().trim().required(),
// 		province: Joi.string().trim().required(),
// 		volume: Joi.number().sign('positive').greater(1).required(),
// 	});
// 	Joi.valid(req.body, schema, (err, result) => {
// 		if (err) {
// 			res.send('invalid input');
// 		}
// 		res.send('500');
// 	});
// 	//database work
// 	res.json({ success: true });
// });

app.listen(3000);
