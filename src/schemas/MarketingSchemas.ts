// GET
export interface IReadMarketingWalletsQuery {
	wallet: string;
	amount: string;
	fee: string;
	hash: string;
	date_start: string;
	date_end: string;
	page: number;
	entry: number;
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