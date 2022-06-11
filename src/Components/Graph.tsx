import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  ChartType,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { PriceItem } from "../api/api";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hooks";
import { selectIsLoading,selectFavDates,setDateFavoriteAsync,unsetDateFavoriteAsync } from "../Features/HomePage/appSlice";
import {
  Container,
  Title as MantineTitle,
  Text,
  Center,
  Loader,
  Stack,
  Button,
  SegmentedControl,
} from "@mantine/core";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
const options: ChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "BTC daily prices in USD/ILS",
    },
  },
};

// export const data:ChartData = {
//   labels,
//   datasets: [
//     {
//       label: 'Dataset 1',
//       data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//       borderColor: 'rgb(255, 99, 132)',
//       backgroundColor: 'rgba(255, 99, 132, 0.5)',
//     },
//     {
//       label: 'Dataset 2',
//       data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//       borderColor: 'rgb(53, 162, 235)',
//       backgroundColor: 'rgba(53, 162, 235, 0.5)',
//     },
//   ],
// };

const USD ='usd'
const ILS = 'ils'
export function LineGraph({
  dailyPriceData,
}: {
  dailyPriceData: PriceItem;
}) {
    const dispatch = useAppDispatch()
  const isAppLoading = useSelector(selectIsLoading);
  const [selectedCurrency, setSelectedCurrency] = useState("ils");
  const favDates = useSelector(selectFavDates)
  const isCurrentDateFav = favDates.find(favDates=>favDates.date === dailyPriceData.date) && true
  const labels: string[] = ["open", "low", "high", "close"];
  const getPricesAtCurrency = () => {
    const numbersData: number[] = [
        dailyPriceData.open as number,
        dailyPriceData.low as number,
        dailyPriceData.high as number,
        dailyPriceData.close as number,
      ];
    return selectedCurrency === ILS ?
     numbersData :
     numbersData.map(ilsVal=>ilsVal/(dailyPriceData.ilsUsdRatio as number))
  }
  const numbersData: number[] = [
    dailyPriceData.open as number,
    dailyPriceData.low as number,
    dailyPriceData.high as number,
    dailyPriceData.close as number,
  ];
  const dataIsValid = dailyPriceData.open !== 0;
  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: `${dailyPriceData.date}`,
        data:getPricesAtCurrency(),
        borderColor: "#ffa94d",
        backgroundColor: "#ffb95d",
      },
    ],
  };

  return (
    <>
      {dataIsValid ? (
        <Stack>
            
          <Center>
          <Text mr={15} >Show prices in</Text>
            <SegmentedControl
              sx={{ minWidth: "200px" }}
              color="orange"
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              data={[
                { label: "ILS", value: ILS },
                { label: "USD", value: USD },
              ]}
            />
          </Center>
          <Center>
            <Line options={options} data={data} />
           
          </Center>
          <Button
            loading={isAppLoading}
              mb={30}
              size="md"
              fullWidth
              variant="gradient"
              gradient={
                !isCurrentDateFav ?  
                  {from: "indigo", to: "cyan" }
                  :
                  {from: "red", to: "orange" }
              }
              onClick={async ()=>{
                  if(isCurrentDateFav){
                      await dispatch(unsetDateFavoriteAsync({dailyPriceItem:dailyPriceData}))
                  }else{
                    await dispatch(setDateFavoriteAsync({dailyPriceItem:dailyPriceData}))
                  }
              }}
            >
             {isCurrentDateFav? 'Remove from favorites':'Add to favorites'}
            </Button>
        </Stack>
      ) : isAppLoading ? (
        <Center>
          <Container size="md">
            <Loader mt={10} size="xl" variant="bars" />;
            <MantineTitle order={1}>Loading...</MantineTitle>
            <Text p={"md"} sx={{ whiteSpace: "pre-line" }}>
              Your Graph will be ready soon
            </Text>
          </Container>
        </Center>
      ) : (
        <Text size="lg" weight={"700"}>
          Please Pick a date to see the relevant prices
        </Text>
      )}
    </>
  );
}