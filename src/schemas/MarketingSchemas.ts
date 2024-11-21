// GET
export interface IReadMarketingWalletsQuery {
	wallet: string;
	amount: string;
	fee: string;
	hash: string;
	received_type: string;
	date_start: string;
	date_end: string;
	page: number;
	entry: number;
}

// POST
export interface ISendTokenFeedbackBody {
	address: string;
	feedback_id: number;
}

// ----- SUCCESS & ERROR -----
export interface IResponseSuccessful {
  status: number;
  message: string;
}
export interface IResponseError {
  status: number;
  message: string;
}