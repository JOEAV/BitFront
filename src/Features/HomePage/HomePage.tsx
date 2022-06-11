import { Title,Text, Container, Center, Button } from "@mantine/core";
import { HeaderResponsive } from "../../Components/HeaderResponsive";
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { Dayjs, default as dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../app/hooks";
import {getPriceByDateAsync,getFavPricesAsync,selectCachedViewedDates, selectFavDates} from './appSlice';
import { LineGraph } from "../../Components/Graph";
import { PriceItem } from "../../api/api";
const PRICE_ITEM_DATE_KEY_FORMAT = 'YYYY-MM-DD'
const formatDayObjectAsDbKey = (date:Date|null) => dayjs(date).format(PRICE_ITEM_DATE_KEY_FORMAT).toString()
export default function HomePage() {
  const FIRST_AVAILABLE_DATE:string = '2019-09-16'
  const isMobile = useMediaQuery('(max-width: 755px)');
  const dispatch = useAppDispatch()
  const [pickedDate, onPickedDateChanged] = useState<Date|null>(null);
  const pickedDateFormatted =formatDayObjectAsDbKey(pickedDate)
  const favDates = useSelector(selectFavDates)
  const viewedDates = useSelector(selectCachedViewedDates)
  const pickedDayChartData = ()=>{
    const cachedDate:PriceItem|undefined = viewedDates.find(val=>val.date === pickedDateFormatted)
    return cachedDate ? {
      open:cachedDate.open,
      close:cachedDate.close,
      high:cachedDate.high,
      low:cachedDate.low,
      date:cachedDate.date,
      ilsUsdRatio:cachedDate.ilsUsdRatio,
      fav: cachedDate.fav
    }as PriceItem: {open:0,close:0,high:0,low:0,fav:false,date:'',ilsUsdRatio:0} as PriceItem
  }
  useEffect( ()=>{
    if(favDates.length === 0){
      dispatch(getFavPricesAsync())
    }
  },[])
  return (
    <>
    <HeaderResponsive pageName="home"
    />
    <main>
      <Container>
      <Title order={2}>Welcome to Bitfront</Title>
      <Title order={4}
       sx={(theme) => ({
        color: theme.colors.orange[4],
       })}>Your Bitcoin rate tracker</Title>
       <Center mt={20}>
       <DatePicker 
       value={pickedDate} onChange={async (date:Date)=>{ 
        onPickedDateChanged(date)
        const dayString = formatDayObjectAsDbKey(date)
        if(!viewedDates.find(val=>val.date === dayString)){
          const dateData = await dispatch(getPriceByDateAsync({dateAsDay:dayString}))
        }
        }}
       mt={10}  dropdownType={isMobile ? 'modal' : 'popover'} 
       placeholder="Pick date" label="BTC daily prices"
       maxDate={dayjs().toDate()} minDate={dayjs(FIRST_AVAILABLE_DATE).toDate()} />
       </Center>
       {/* <Text>{pickedDateFormatted}</Text> */}
       <Container mt={20}>
       <LineGraph dailyPriceData={pickedDayChartData()}></LineGraph>
       </Container>
      </Container>
    </main>
    </>
  );
}
