import { Menu, Transition } from "@headlessui/react";
import { HiChevronLeft, HiChevronRight, HiDotsVertical } from "react-icons/hi";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
  isAfter,
} from "date-fns";
import { Fragment, useEffect, useState } from "react";
import { missionReadChild } from "../../api/mission.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  // let today = startOfToday();
  let today = new Date(2023, 5, 29);
  let [selectedDay, setSelectedDay] = useState(today);
  let [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const [completedMissions, setCompletedMissions] = useState([]);
  const [reservedMissions, setReservedMissions] = useState([]);

  useEffect(() => {
    getMission();
  }, []);

  const getMission = async () => {
    const missionsData = await missionReadChild();

    const compMissions = missionsData.filter((data) => {
      return parseISO(data.completed_date) <= today;
    });

    const resMissions = missionsData.filter((data) => {
      return parseISO(data.created_date) > today;
    });
    // console.log(compMissions);
    // console.log(resMissions);

    setCompletedMissions(compMissions);
    setReservedMissions(resMissions);
  };

  let days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  let selectedCompDayMeetings = completedMissions.filter((mission) =>
    isSameDay(parseISO(mission.completed_date), selectedDay)
  );
  // console.log("selectedCompDayMeetings", selectedCompDayMeetings);

  let selectedResDayMeetings = reservedMissions.filter((mission) =>
    isSameDay(parseISO(mission.created_date), selectedDay)
  );
  // console.log("selectedResDayMeetings", selectedResDayMeetings);

  return (
    <div className="pt-16">
      <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6">
        <div className="md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
          <div className="md:pr-14">
            <div className="flex items-center">
              <h2 className="flex-auto font-semibold text-gray-900">
                {format(firstDayCurrentMonth, "MMMM yyyy")}
              </h2>
              <button
                type="button"
                onClick={previousMonth}
                className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Previous month</span>
                <HiChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={nextMonth}
                type="button"
                className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Next month</span>
                <HiChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>
            <div className="grid grid-cols-7 mt-2 text-sm">
              {days.map((day, dayIdx) => (
                <div
                  key={day.toString()}
                  className={classNames(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    "py-1.5"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={classNames(
                      isEqual(day, selectedDay) && "text-white",
                      !isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "text-red-500",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-gray-900",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-gray-400",
                      isEqual(day, selectedDay) && isToday(day) && "bg-red-500",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-gray-900",
                      !isEqual(day, selectedDay) && "hover:bg-gray-200",
                      (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                    )}
                  >
                    <time dateTime={format(day, "yyyy-MM-dd")}>
                      {format(day, "d")}
                    </time>
                  </button>

                  <div className="w-1 h-1 mx-auto mt-1">
                    {/* 완료된 미션 */}
                    {completedMissions.some((mission) =>
                      isSameDay(parseISO(mission.completed_date), day)
                    ) && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    )}
                    {/* 예약된 미션 */}
                    {reservedMissions.some(
                      (mission) =>
                        isAfter(parseISO(mission.created_date), new Date()) &&
                        isSameDay(parseISO(mission.created_date), day)
                    ) && (
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <section className="mt-12 md:mt-0 md:pl-14">
            <h2 className="font-semibold text-gray-900">미션</h2>
            <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
              {selectedCompDayMeetings.length > 0
                ? selectedCompDayMeetings.map((mission) => (
                    <Meeting key={mission.id} Mission={mission} />
                  ))
                : ""}
              {selectedResDayMeetings.length > 0
                ? selectedResDayMeetings.map((mission) => (
                    <Meeting key={mission.id} Mission={mission} flag={true} />
                  ))
                : ""}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Meeting({ Mission, flag }) {
  // let DateTime = parseISO(meeting.MissionDatetime);

  return (
    <li className="flex items-center px-1 py-2 space-x-4 group rounded-xl focus-within:bg-gray-100 hover:bg-gray-100">
      <div className="flex-auto">
        <p className="text-gray-900">{Mission.content}</p>
        <p className="mt-0.5">
          <time dateTime={Mission.completed_date}>
            {flag === true
              ? `${Mission.created_date} 예약`
              : `${Mission.completed_date} 완료`}
          </time>
        </p>
      </div>
      <Menu
        as="div"
        className="relative opacity-0 focus-within:opacity-100 group-hover:opacity-100"
      >
        <div>
          <Menu.Button className="-m-2 flex items-center rounded-full p-1.5 text-gray-500 hover:text-gray-600">
            <span className="sr-only">Open options</span>
            <HiDotsVertical className="w-6 h-6" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right bg-white rounded-md shadow-lg w-36 ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Edit
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Cancel
                  </a>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </li>
  );
}

let colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
