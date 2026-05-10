import { useState } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  humidity: number;
  wind: number;
  feelsLike: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  icon: string;
  condition: string;
  precipitation: number;
}

interface HourlyData {
  time: string;
  temp: number;
  icon: string;
}

interface City {
  id: string;
  name: string;
  weather: WeatherData;
  forecast: ForecastDay[];
  hourly: HourlyData[];
}

const cities: City[] = [
  {
    id: 'jhb',
    name: 'Johannesburg, SA',
    weather: {
      temp: 24,
      condition: 'Partly Cloudy',
      location: 'Johannesburg, SA',
      humidity: 45,
      wind: 12,
      feelsLike: 22,
      uvIndex: 7,
      visibility: 10,
      pressure: 1013,
      sunrise: '05:45',
      sunset: '18:30',
    },
    forecast: [
      { day: 'Mon', high: 26, low: 18, icon: 'sun', condition: 'Sunny', precipitation: 0 },
      { day: 'Tue', high: 28, low: 19, icon: 'sun', condition: 'Sunny', precipitation: 0 },
      { day: 'Wed', high: 25, low: 17, icon: 'cloud', condition: 'Cloudy', precipitation: 20 },
      { day: 'Thu', high: 23, low: 16, icon: 'cloud-rain', condition: 'Rainy', precipitation: 70 },
      { day: 'Fri', high: 27, low: 18, icon: 'sun', condition: 'Sunny', precipitation: 5 },
    ],
    hourly: [
      { time: 'Now', temp: 24, icon: 'cloud-sun' },
      { time: '15:00', temp: 26, icon: 'sun' },
      { time: '18:00', temp: 23, icon: 'cloud-sun' },
      { time: '21:00', temp: 20, icon: 'cloud' },
      { time: '00:00', temp: 18, icon: 'moon' },
      { time: '03:00', temp: 17, icon: 'moon' },
    ],
  },
  {
    id: 'cpt',
    name: 'Cape Town, SA',
    weather: {
      temp: 18,
      condition: 'Cloudy',
      location: 'Cape Town, SA',
      humidity: 65,
      wind: 18,
      feelsLike: 16,
      uvIndex: 5,
      visibility: 8,
      pressure: 1015,
      sunrise: '06:15',
      sunset: '19:00',
    },
    forecast: [
      { day: 'Mon', high: 20, low: 14, icon: 'cloud', condition: 'Cloudy', precipitation: 30 },
      { day: 'Tue', high: 19, low: 13, icon: 'cloud-rain', condition: 'Rainy', precipitation: 60 },
      { day: 'Wed', high: 21, low: 15, icon: 'cloud-sun', condition: 'Partly Cloudy', precipitation: 20 },
      { day: 'Thu', high: 22, low: 16, icon: 'sun', condition: 'Sunny', precipitation: 10 },
      { day: 'Fri', high: 23, low: 17, icon: 'sun', condition: 'Sunny', precipitation: 5 },
    ],
    hourly: [
      { time: 'Now', temp: 18, icon: 'cloud' },
      { time: '15:00', temp: 19, icon: 'cloud' },
      { time: '18:00', temp: 17, icon: 'cloud' },
      { time: '21:00', temp: 15, icon: 'cloud' },
      { time: '00:00', temp: 14, icon: 'cloud' },
      { time: '03:00', temp: 13, icon: 'cloud-rain' },
    ],
  },
];

export function Weather() {
  const [selectedCityId, setSelectedCityId] = useState('jhb');
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [showHourly, setShowHourly] = useState(true);
  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? cities[0];
  const currentWeather = selectedCity.weather;

  const convertTemp = (temp: number): number =>
    unit === 'F' ? Math.round((temp * 9) / 5 + 32) : temp;

  const WeatherIcon = ({ icon, className }: { icon: string; className?: string }) => {
    const iconClass = cn('transition-transform duration-300 group-hover:scale-110', className);
    switch (icon) {
      case 'sun':
        return <Icons.Sun className={cn(iconClass, 'text-primary-300')} />;
      case 'cloud':
        return <Icons.Cloud className={cn(iconClass, 'text-white/55')} />;
      case 'cloud-rain':
        return <Icons.CloudRain className={cn(iconClass, 'text-primary-300')} />;
      case 'moon':
        return <Icons.Moon className={cn(iconClass, 'text-white/50')} />;
      default:
        return <Icons.CloudSun className={cn(iconClass, 'text-primary-300')} />;
    }
  };

  const details = [
    { label: 'Feels Like', value: `${convertTemp(currentWeather.feelsLike)}°`, icon: Icons.Thermometer },
    { label: 'Humidity', value: `${currentWeather.humidity}%`, icon: Icons.Droplets },
    { label: 'Wind', value: `${currentWeather.wind} km/h`, icon: Icons.Wind },
    { label: 'Visibility', value: `${currentWeather.visibility} km`, icon: Icons.Eye },
    { label: 'UV Index', value: String(currentWeather.uvIndex), icon: Icons.Sun },
    { label: 'Pressure', value: `${currentWeather.pressure} mb`, icon: Icons.Gauge },
  ];

  return (
    <div className="w-full h-full overflow-hidden bg-os-ink-950 text-white">
      <div className="relative h-full overflow-y-auto">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_22%_12%,rgba(239,68,68,0.18),transparent_32%),radial-gradient(circle_at_88%_4%,rgba(255,255,255,0.10),transparent_28%),linear-gradient(150deg,#0f0f10_0%,#18181b_48%,#0b0b0c_100%)]" />
        <div className="relative min-h-full p-5 lg:p-7">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-white/45 text-xs uppercase tracking-[0.14em] font-semibold">
                <Icons.CloudSun className="w-4 h-4 text-primary-300" />
                Weather
              </div>
              <h1 className="mt-1 text-xl font-semibold text-white">Local atmosphere</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-os-line-dark bg-os-ink-900/80 p-1 flex">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCityId(city.id)}
                    className={cn(
                      'os-interactive os-focus-ring px-3 py-1.5 rounded-lg text-xs font-medium',
                      selectedCityId === city.id
                        ? 'bg-primary-500 text-white shadow-glow-primary'
                        : 'text-white/55 hover:bg-os-ink-800 hover:text-white'
                    )}
                  >
                    {city.name.split(',')[0]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
                className="os-interactive os-focus-ring h-9 w-11 rounded-xl border border-os-line-dark bg-os-ink-900/80 text-xs font-semibold text-white/70 hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:text-white"
              >
                °{unit}
              </button>
            </div>
          </header>

          <main className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] gap-4">
            <section className="rounded-[22px] border border-os-line-dark bg-os-ink-900/70 overflow-hidden shadow-os-window">
              <div className="relative min-h-[360px] p-6 sm:p-8 flex flex-col justify-between">
                <div className="absolute inset-0 pointer-events-none opacity-70 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_70%_45%,rgba(239,68,68,0.22),transparent_34%)]" />
                <div className="relative flex items-start justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-primary-200 text-xs font-semibold uppercase tracking-[0.12em]">
                      <Icons.MapPin className="w-4 h-4" />
                      {currentWeather.location}
                    </div>
                    <div className="mt-6 flex items-end gap-4">
                      <span className="text-8xl sm:text-9xl font-semibold tracking-[-0.04em] leading-[0.82]">
                        {convertTemp(currentWeather.temp)}°
                      </span>
                      <div className="pb-2">
                        <p className="text-lg font-medium text-white/90">{currentWeather.condition}</p>
                        <p className="text-sm text-white/45">Feels like {convertTemp(currentWeather.feelsLike)}°</p>
                      </div>
                    </div>
                  </div>
                  <div className="os-interactive group hidden sm:flex w-36 h-36 rounded-[28px] border border-os-line-dark bg-os-ink-800/50 items-center justify-center hover:border-os-line-dark-hover hover:bg-os-ink-800/80">
                    <WeatherIcon icon="cloud-sun" className="w-24 h-24" />
                  </div>
                </div>

                <div className="relative mt-10 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Sunrise', value: currentWeather.sunrise, icon: Icons.Sunrise },
                    { label: 'Sunset', value: currentWeather.sunset, icon: Icons.Sunset },
                    { label: 'Outlook', value: 'Stable', icon: Icons.Activity },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="os-interactive rounded-2xl border border-os-line-dark bg-os-ink-950/40 p-4 hover:border-os-line-dark-hover hover:bg-os-ink-800/60">
                        <Icon className="w-4 h-4 text-primary-300 mb-3" />
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/35 font-semibold">{item.label}</p>
                        <p className="text-sm font-semibold text-white/85 mt-1">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-[22px] border border-os-line-dark bg-os-ink-900/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white/85">Conditions</h2>
                  <Icons.SlidersHorizontal className="w-4 h-4 text-white/35" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {details.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-os-line-dark bg-os-ink-950/40 p-4 transition-colors hover:border-os-line-dark-hover hover:bg-os-ink-800/55"
                      >
                        <Icon className="w-4 h-4 text-white/45 mb-4" />
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/30 font-semibold">{item.label}</p>
                        <p className="mt-1 text-lg font-semibold text-white/85">{item.value}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[22px] border border-os-line-dark bg-os-ink-900/70 p-4">
                <h2 className="mb-3 text-sm font-semibold text-white/85">5 day forecast</h2>
                <div className="space-y-2">
                  {selectedCity.forecast.map((day) => (
                    <motion.div
                      key={day.day}
                      whileHover={{ x: 3 }}
                      className="group os-row-hover grid grid-cols-[40px_28px_1fr_auto] items-center gap-3 rounded-xl border border-os-line-dark bg-os-ink-950/35 px-3 py-2.5"
                    >
                      <span className="text-xs font-semibold text-white/45">{day.day}</span>
                      <WeatherIcon icon={day.icon} className="w-5 h-5" />
                      <span className="text-xs text-white/45 truncate">{day.condition}</span>
                      <span className="text-sm font-semibold text-white/85">
                        {convertTemp(day.high)}° <span className="text-white/30">{convertTemp(day.low)}°</span>
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </main>

          <AnimatePresence>
            {showHourly && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 rounded-[22px] border border-os-line-dark bg-os-ink-900/70 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white/85">Hourly</h2>
                  <button
                    onClick={() => setShowHourly(false)}
                    className="os-interactive os-focus-ring rounded-lg px-2 py-1 text-xs text-white/40 hover:bg-os-ink-800/70 hover:text-white/70"
                  >
                    Hide
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedCity.hourly.map((hour) => (
                    <div key={hour.time} className="group os-interactive min-w-[92px] rounded-2xl border border-os-line-dark bg-os-ink-950/40 p-4 text-center hover:border-os-line-dark-hover hover:bg-os-ink-800/60">
                      <p className="text-xs text-white/40">{hour.time}</p>
                      <WeatherIcon icon={hour.icon} className="mx-auto my-4 w-7 h-7" />
                      <p className="text-lg font-semibold">{convertTemp(hour.temp)}°</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
