import { addDays, eachDayOfInterval, format, subDays } from "date-fns";
import { GenerateDaysProps, UserCycleData } from "@/types/menstrual.types";

export function generateDays({
  startDate,
  endDate,
  colorCode,
  category,
  customProps,
}: GenerateDaysProps) {
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  let formattedDates = {};
  for (const date of dates) {
    let fDate = format(date, "yyyy-MM-dd");
    formattedDates[fDate] = {
      selected: true,
      selectedColor: colorCode,
      category: category,
      ...customProps,
    };
  }
  return formattedDates;
}

export function extractDates(dates: UserCycleData[]) {
  let res = {};
  for (const data of dates) {
    let menstrualOptions = {
      startDate: data.start_date,
      endDate: data.bleed_end_date,
      colorCode: data.id ? "#E82A73" : "#FFFFFF",
      category: "MENSTRUAL",
      customProps: {
        customStyles: {
          container: {
            width: 35.43,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 40,
            position: "relative",
            bottom: 0,
          },
          text: { color: "white", fontSize: 14, textAlign: "center" },
        },
      },
    };

    if (data.id === null) {
      menstrualOptions = {
        ...menstrualOptions,
        customProps: {
          customStyles: {
            container: {
              width: 35.43,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 40,
              position: "relative",
              bottom: 0,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#E82A73",
            },
            text: { color: "black", fontSize: 14, textAlign: "center" },
          },
        },
      };
    }
    const menstrualDays = generateDays(menstrualOptions);
    const ovulationDays = generateDays({
      startDate: subDays(data.ovulation_day, 2),
      endDate: addDays(data.ovulation_day, 2),
      colorCode: "#DEE4F5",
      category: "OVULATION",
      customProps: {
        customStyles: {
          container: {
            width: 35.43,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 40,
            // position: "relative",
            bottom: 0,
          },
          text: { color: "black", fontSize: 14, textAlign: "center" },
        },
      },
    });

    let safeDays = {};
    for (const safeRange of data.safe_days) {
      safeDays = {
        ...safeDays,
        ...generateDays({
          startDate: safeRange.start_date,
          endDate: safeRange.end_date,
          colorCode: "#3CB9FB99",
          category: "NORMAL",
          customProps: {
            customStyles: {
              container: {
                width: 35.43,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 40,
                position: "relative",
                bottom: 0,
              },
              text: { color: "black", fontSize: 14, textAlign: "center" },
            },
          },
        }),
      };
    }
    res = { ...res, ...ovulationDays, ...safeDays, ...menstrualDays };
  }
  return res;
}
