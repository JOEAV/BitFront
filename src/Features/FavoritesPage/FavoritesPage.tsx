import { Title, Container, Center, Select } from "@mantine/core";
import { HeaderResponsive } from "../../Components/HeaderResponsive";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../app/hooks";
import {getFavPricesAsync, getPriceByDateAsync, selectCachedViewedDates, selectFavDates} from '../HomePage/appSlice';
import { LineGraph } from "../../Components/Graph";
import { PriceItem } from "../../api/api";
import dayjs from 'dayjs'
const PRICE_ITEM_DATE_KEY_FORMAT = 'YYYY-MM-DD'

const formatDayObjectAsDbKey = (date:Date|null) => dayjs(date).format(PRICE_ITEM_DATE_KEY_FORMAT).toString()
const nullable_item:PriceItem ={
    open:0,close:0,high:0,low:0,fav:false,date:'',ilsUsdRatio:0
  }
export default function FavoritesPage() {
  const dispatch = useAppDispatch()
  const [pickedDate, onPickedDateChanged] = useState<string|null>('');
  const favDates = useSelector(selectFavDates)
  const viewedDates = useSelector(selectCachedViewedDates)
  const todayDateString = formatDayObjectAsDbKey(dayjs().toDate())
  const yesterdayDateString = formatDayObjectAsDbKey(dayjs().subtract(1,'day').toDate())
  //comparing with yesterday if the external marketAPI (which runs on UTC) still
//didn't updated todays (Local GMT+2) price item
const todaysPriceItem =  viewedDates.find(val=>val.date === todayDateString) ||
viewedDates.find(val=>val.date === yesterdayDateString)
|| nullable_item
  const pickedDayChartData = ()=>{
    const favDate:PriceItem|undefined = favDates.find(val=>val.date === pickedDate)
    return favDate ? {
      open:favDate.open,
      close:favDate.close,
      high:favDate.high,
      low:favDate.low,
      date:favDate.date,
      ilsUsdRatio:favDate.ilsUsdRatio,
      fav: favDate.fav
    }as PriceItem: {open:0,close:0,high:0,low:0,fav:false,date:'',ilsUsdRatio:0} as PriceItem
  }
  useEffect( ()=>{
    if(favDates.length === 0){
      dispatch(getFavPricesAsync())
    }
  },[favDates])
  useEffect(()=>{
    if(todaysPriceItem === nullable_item){
      dispatch(getPriceByDateAsync({dateAsDay:todayDateString}))
    }
  },[])
  return (
    <>
    <HeaderResponsive pageName="favorites"
    />
    <main>
      <Container>
          <Center>
          <Title order={4}>Your Favorites Dates for BTC prices</Title>
          
          </Center>
         <Center>
         <Title order={4}
       sx={(theme) => ({
        color: theme.colors.orange[4],
       })}>It's that simple</Title>
         </Center>

       <Center mt={20}>
       <Select mb={20} value={pickedDate} onChange={onPickedDateChanged} data={favDates.map(val=>val.date)} />
       </Center>
       
           <Container>
       <LineGraph todayPriceData={todaysPriceItem} onRemoveFavCalled={()=>onPickedDateChanged('')} dailyPriceData={pickedDayChartData()}></LineGraph>
       </Container>
       
       
      </Container>
    </main>
    </>
  );
}
