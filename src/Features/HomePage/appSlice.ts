import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios,{ AxiosError, AxiosResponse } from 'axios';
import { RootState, AppThunk } from '../../app/store';
import { getAllPrices,getFavPrices,getPriceByDate,setDateFavorite,unsetDateFavorite,PriceItem } from '../../api/api'

export interface AppState{
    value:{
        viewedDates:PriceItem[] | [],
        favDates:PriceItem[] | [],
    }
    //Todo: write meaningfull errors from api
    status:'empty'|'loaded'|'loading'|'error'
}    
const appInitialState: AppState = {
  value: {viewedDates:[],favDates:[]},
  status: 'empty',
};


// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const getPriceByDateAsync = createAsyncThunk(
  'app/getPriceByDate',
  async ({dateAsDay}:{dateAsDay:string},thunkAPI) => {
    try{
      const response = await getPriceByDate({dateAsDay})
      console.log(response)
      return response
    }catch(err){
      if(axios.isAxiosError(err)){
        return thunkAPI.rejectWithValue(err)  
        }
      }
   
  })
  export const getFavPricesAsync = createAsyncThunk(
    'app/getFavPrices',
    async (_,thunkAPI) => {
      try{
        const response = await getFavPrices()
        console.log(response)
        return response
      }catch(err){
        if(axios.isAxiosError(err)){
          return thunkAPI.rejectWithValue(err)  
          }
        }
     
    })
  export const setDateFavoriteAsync = createAsyncThunk(
    'app/setDateFavorite',
    async ({dailyPriceItem}:{dailyPriceItem:PriceItem},thunkAPI) => {
      try{
        const response = await setDateFavorite({dailyPriceItem})
        console.log(response)
        return dailyPriceItem
      }catch(err){
        if(axios.isAxiosError(err)){
          return thunkAPI.rejectWithValue(err)  
          }
        }
     
    })
    export const unsetDateFavoriteAsync = createAsyncThunk(
      'app/unsetDateFavorite',
      async ({dailyPriceItem}:{dailyPriceItem:PriceItem},thunkAPI) => {
        try{
          const response = await unsetDateFavorite({dailyPriceItem})
          console.log(response)
          return dailyPriceItem
        }catch(err){
          if(axios.isAxiosError(err)){
            return thunkAPI.rejectWithValue(err)  
            }
          }
       
      })
  

export const appSlice = createSlice({
  name: 'app',
  initialState:appInitialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(getPriceByDateAsync.pending, (state) => {
        state.status = 'loading';

      })
      .addCase(getPriceByDateAsync.fulfilled, (state,{payload}) => {
        if(payload&&payload.data){
          const data:PriceItem = payload.data
          // if(!state.value.viewedDates.slice(0).includes(data))
          state.value.viewedDates = [...state.value.viewedDates,data]
          state.status = 'loaded'
        }
        
      })
      .addCase(getPriceByDateAsync.rejected, (state,{payload}) => {
        console.log('reject payload', payload)
          state.status='error'

        })
        .addCase(getFavPricesAsync.pending, (state) => {
          state.status = 'loading';
  
        })
        .addCase(getFavPricesAsync.fulfilled, (state,{payload}) => {
          if(payload&&payload.data){
            const data:PriceItem[] = payload.data
            state.value.favDates = data
            state.status = 'loaded'
          }
          
        })
        .addCase(getFavPricesAsync.rejected, (state,{payload}) => {
          console.log('reject payload', payload)
            state.status='error'
  
          })
         .addCase(setDateFavoriteAsync.pending, (state) => {
            state.status = 'loading';
    
          })
          .addCase(setDateFavoriteAsync.fulfilled, (state,{payload}) => {
            if(payload){
              const data:PriceItem = payload
              state.value.favDates = [...state.value.favDates,data]
              state.status = 'loaded'
            }
            
          })
          .addCase(setDateFavoriteAsync.rejected, (state,{payload}) => {
            console.log('reject payload', payload)
              state.status='error'
    
          })
          .addCase(unsetDateFavoriteAsync.pending, (state) => {
            state.status = 'loading';
    
          })
          .addCase(unsetDateFavoriteAsync.fulfilled, (state,{payload}) => {
            if(payload){
              const data:PriceItem = payload
              const newFavArr = state.value.favDates.filter(x=>x.date!==data.date)
              state.value.favDates = newFavArr
              state.status = 'loaded'
            }
            
          })
          .addCase(unsetDateFavoriteAsync.rejected, (state,{payload}) => {
            console.log('reject payload', payload)
              state.status='error'
    
          })
      
    
  },
});

// export const {addEventCycles,clearRegistrationErrorFlag} = eventsSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectCachedViewedDates = (state:RootState) => state.app.value.viewedDates
export const selectFavDates = (state:RootState) => state.app.value.favDates
export const selectIsLoading = (state:RootState) => state.app.status === 'loading'
// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

export default appSlice.reducer;
