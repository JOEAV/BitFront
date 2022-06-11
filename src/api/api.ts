import axios, { AxiosResponse } from "axios"

export interface PriceItem{
    date:string,
    fav:boolean,
    low:number,
    high:number,
    close:number,
    open:number,
    ilsUsdRatio:number
}

axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';  

export interface HttpResponse<T> extends Response{
  parsedBody:T;

}


export async function getAllPrices() {
  return  axios.get( `https://ab17h4imt5.execute-api.us-east-1.amazonaws.com/dev/dailyPrices`)
}

export async function getFavPrices() {
    return  axios.get( 'https://ab17h4imt5.execute-api.us-east-1.amazonaws.com/dev/dailyPrices?date=fav')
}

  export async function getPriceByDate({dateAsDay}:{
    dateAsDay:string
  }) {
    return  axios.get( `https://ab17h4imt5.execute-api.us-east-1.amazonaws.com/dev/dailyPrices?date=${dateAsDay}`)
  }

  export async function setDateFavorite({dailyPriceItem}:{dailyPriceItem:PriceItem}) { 
    debugger;
    const itemAsFavorite = {...dailyPriceItem,...{fav:true}}
    return  axios.put( `https://ab17h4imt5.execute-api.us-east-1.amazonaws.com/dev/dailyPrices`,itemAsFavorite)
  }

 
  export async function unsetDateFavorite({dailyPriceItem}:{dailyPriceItem:PriceItem}) {
    const itemAsFavorite = {...dailyPriceItem,...{fav:false}}
   return  axios.put('https://ab17h4imt5.execute-api.us-east-1.amazonaws.com/dev/dailyPrices',itemAsFavorite)
 }