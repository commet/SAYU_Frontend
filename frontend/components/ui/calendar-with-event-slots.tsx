"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "little-date";

// Calendar component
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

// Card components
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Icons
const ChevronLeft = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn("h-4 w-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn("h-4 w-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Clock = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn("h-4 w-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

// Event interface
interface Event {
  id: string;
  title: string;
  time: Date;
  description?: string;
  color?: string;
}

// Main calendar component
export function Calendar31() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Sample events data
  const events: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      time: new Date(2024, 0, 15, 10, 0),
      description: '주간 스탠드업 미팅',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: '프로젝트 리뷰',
      time: new Date(2024, 0, 15, 14, 30),
      description: 'Q1 프로젝트 진행사항 검토',
      color: 'bg-green-500'
    },
    {
      id: '3',
      title: '클라이언트 미팅',
      time: new Date(2024, 0, 16, 11, 0),
      description: '새로운 프로젝트 논의',
      color: 'bg-purple-500'
    },
  ];

  // Filter events for selected date
  const selectedDateEvents = selectedDate
    ? events.filter(
        (event) =>
          event.time.toDateString() === selectedDate.toDateString()
      )
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-6xl">
      {/* Calendar */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>일정 관리</CardTitle>
          <CardDescription>
            날짜를 선택하여 해당일의 일정을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Event slots */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'YYYY년 M월 D일') : '날짜를 선택하세요'}
          </CardTitle>
          <CardDescription>
            {selectedDateEvents.length > 0
              ? `${selectedDateEvents.length}개의 일정이 있습니다`
              : '예정된 일정이 없습니다'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/50"
                >
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full mt-1.5",
                      event.color || 'bg-gray-500'
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(event.time, 'HH:mm')}
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>이 날짜에는 예정된 일정이 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { Calendar, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };