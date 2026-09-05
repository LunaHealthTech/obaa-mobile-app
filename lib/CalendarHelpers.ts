import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  subDays,
} from "date-fns";
import {
  CyclePhase,
  DayMarking,
  GenerateDaysProps,
  UserCycleData,
} from "@/types/menstrual.types";

export function computeCycleDay(date: Date | string, cycle: UserCycleData) {
  return differenceInCalendarDays(new Date(date), new Date(cycle.start_date)) + 1;
}

export function computeCyclePhase(
  date: Date | string,
  cycle: UserCycleData,
): CyclePhase {
  const d = new Date(date);
  const bleedEnd = new Date(cycle.bleed_end_date);
  const ovulation = new Date(cycle.ovulation_day);

  if (!isAfter(d, bleedEnd)) return "Menstrual";
  if (isSameDay(d, ovulation)) return "Ovulation";
  if (isBefore(d, ovulation)) return "Follicular";
  return "Luteal";
}

export function generateDays({
  startDate,
  endDate,
  colorCode,
  category,
  customProps,
  cycle,
}: GenerateDaysProps) {
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  let formattedDates: Record<string, DayMarking> = {};
  for (const date of dates) {
    let fDate = format(date, "yyyy-MM-dd");
    formattedDates[fDate] = {
      selected: true,
      selectedColor: colorCode,
      category: category,
      ...(cycle && {
        cycleId: cycle.id,
        predicted: cycle.predicted,
        cycleDay: computeCycleDay(date, cycle),
        phase: computeCyclePhase(date, cycle),
      }),
      ...customProps,
    };
  }
  return formattedDates;
}

export function extractDates(
  dates: UserCycleData[],
): Record<string, DayMarking> {
  let res: Record<string, DayMarking> = {};
  for (const data of dates) {
    let menstrualOptions = {
      startDate: data.start_date,
      endDate: data.bleed_end_date,
      colorCode: data.predicted ? "#FFFFFF" : "#E82A73",
      category: "MENSTRUAL",
      cycle: data,
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

    if (data.predicted) {
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
    const fertileWindowStyle = {
      customStyles: {
        container: {
          width: 35.43,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          bottom: 0,
        },
        text: { color: "black", fontSize: 14, textAlign: "center" },
      },
    };
    const ovulationDays = {
      ...generateDays({
        startDate: subDays(data.ovulation_day, 2),
        endDate: subDays(data.ovulation_day, 1),
        colorCode: "#DEE4F5",
        category: "OVULATION",
        cycle: data,
        customProps: fertileWindowStyle,
      }),
      ...generateDays({
        startDate: addDays(data.ovulation_day, 1),
        endDate: addDays(data.ovulation_day, 2),
        colorCode: "#DEE4F5",
        category: "OVULATION",
        cycle: data,
        customProps: fertileWindowStyle,
      }),
      // Ovulation day itself is called out separately from the fertile window band
      ...generateDays({
        startDate: data.ovulation_day,
        endDate: data.ovulation_day,
        colorCode: "#07226B",
        category: "OVULATION",
        cycle: data,
        customProps: {
          customStyles: {
            container: fertileWindowStyle.customStyles.container,
            text: { color: "white", fontSize: 14, textAlign: "center" },
          },
        },
      }),
    };

    let safeDays: Record<string, DayMarking> = {};
    for (const safeRange of data.safe_days) {
      safeDays = {
        ...safeDays,
        ...generateDays({
          startDate: safeRange.start_date,
          endDate: safeRange.end_date,
          colorCode: "#3CB9FB50",
          category: "NORMAL",
          cycle: data,
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
