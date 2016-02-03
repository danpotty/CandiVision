'use strict';
let mongoose = require('mongoose');

let InvoiceSchema = new mongoose.Schema({
	completeChargeResponse: {},
	user: {
		email: String,
		_id: String
		},
	amount: Number,
	amount_refunded: Number,
	chargeId: String,
	description: String,
	paid: Boolean,
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Invoice', InvoiceSchema);