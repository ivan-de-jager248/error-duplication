import { secret } from "encore.dev/config";
import log from "encore.dev/log";

let holidays: Date[] = [];
const CalendarificAPIKey = secret('CalendarificAPIKey');
const CalendarificCountry = secret('CalendarificCountry');

// Helper function to calculate working days
export const calculateWorkingDays = async (startDate: Date, endDate: Date): Promise<number> => {
    log.info(`calculateWorkingDays called with startDate: ${startDate}, endDate: ${endDate}`);
    let workingDays = 0;
    let currentDate = new Date(startDate);

    // Ensure we include the end date in the calculation
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    while (currentDate < adjustedEndDate) {
        log.info(`Checking date: ${currentDate}`);
        if (!isWeekend(currentDate) && !(await isHoliday(currentDate))) {
            workingDays++;
            log.info(`Incremented workingDays to: ${workingDays}`);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    log.info(`Total working days calculated: ${workingDays}`);
    return workingDays;
};

// Check if a date is a weekend
const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6; // Sunday or Saturday
    log.info(`isWeekend called for date: ${date}, result: ${isWeekend}`);
    return isWeekend;
};

// Check if a date is a holiday
const isHoliday = async (date: Date): Promise<boolean> => {
    log.info(`isHoliday called for date: ${date}`);
    if (!holidays.length) {
        log.info(`Holidays array is empty, fetching holidays`);
        holidays = await fetchHolidays(date.getFullYear());
    }

    const isHoliday = holidays.some(holiday => holiday.toDateString() === date.toDateString());
    log.info(`isHoliday result for date: ${date} is ${isHoliday}`);
    return isHoliday;
};

// Fetch holidays from Calendarific API
const fetchHolidays = async (year: number): Promise<Date[]> => {
    log.info(`fetchHolidays called for year: ${year}`);

    const response = await fetch(`https://calendarific.com/api/v2/holidays?api_key=${CalendarificAPIKey()}&country=${CalendarificCountry()}&year=${year}`);
    const data: any = await response.json();

    const holidays = data.response.holidays
        .filter((holiday: any) => holiday.type.includes('National holiday'))
        .map((holiday: any) => new Date(holiday.date.iso));
        
    log.info(`Fetched holidays: ${holidays}`);
    return holidays;
};