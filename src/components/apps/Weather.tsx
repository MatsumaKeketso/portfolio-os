import { useState } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export function Weather() {
  const defaultCities: City[] = [
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
        { time: '12:00', temp: 24, icon: 'sun' },
        { time: '15:00', temp: 26, icon: 'sun' },
        { time: '18:00', temp: 23, icon: 'cloud-sun' },
        { time: '21:00', temp: 20, icon: 'cloud' },
        { time: '00:00', temp: 18, icon: 'moon' },
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
        { time: '12:00', temp: 18, icon: 'cloud' },
        { time: '15:00', temp: 19, icon: 'cloud' },
        { time: '18:00', temp: 17, icon: 'cloud' },
        { time: '21:00', temp: 15, icon: 'cloud' },
        { time: '00:00', temp: 14, icon: 'cloud' },
      ],
    },
  ];

  const [cities, setCities] = useState<City[]>(defaultCities);
  const [selectedCityId, setSelectedCityId] = useState('jhb');
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [showHourly, setShowHourly] = useState(true);

  const selectedCity = cities.find(c => c.id === selectedCityId) || cities[0];
  const currentWeather = selectedCity.weather;

  const convertTemp = (temp: number): number => {
    return unit === 'F' ? Math.round((temp * 9) / 5 + 32) : temp;
  };

  const getWeatherIcon = (icon: string, size: string = 'w-8 h-8') => {
    const iconClass = `${size} transition-all`;
    switch (icon) {
      case 'sun':
        return <Icons.Sun className={`${iconClass} text-accent`} />;
      case 'cloud':
        return <Icons.Cloud className={`${iconClass} text-foreground-tertiary`} />;
      case 'cloud-rain':
        return <Icons.CloudRain className={`${iconClass} text-blue-400`} />;
      case 'cloud-sun':
        return <Icons.CloudSun className={`${iconClass} text-accent`} />;
      case 'moon':
        return <Icons.Moon className={`${iconClass} text-blue-200`} />;
      default:
        return <Icons.CloudSun className={`${iconClass} text-accent`} />;
    }
  };

  const getUVLevel = (uvIndex: number): { level: string; color: string } => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-foreground-success' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-accent' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-400' };
    return { level: 'Very High', color: 'text-foreground-error' };
  };

  const removeCity = (cityId: string) => {
    if (cities.length === 1) return;
    const newCities = cities.filter(c => c.id !== cityId);
    setCities(newCities);
    if (selectedCityId === cityId) {
      setSelectedCityId(newCities[0].id);
    }
  };

  const CircularMetric = ({ label, value, max, icon: Icon, suffix = '' }: any) => {
    const percentage = (value / max) * 100;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="bg-background-tertiary rounded-2xl p-4 flex flex-col items-center justify-center border border-stroke-primary/50 relative group hover:border-accent/30 transition-all">
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-foreground-tertiary/10"
            />
            <motion.circle
              cx="48"
              cy="48"
              r={radius}
              stroke="var(--color-bg-accent)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground-primary leading-none">{value}{suffix}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <Icon className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
        </div>
      </div>
    );
  };

  const uvLevel = getUVLevel(currentWeather.uvIndex);

  return (
    <div className="w-full h-full bg-background-primary text-foreground-primary flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-stroke-primary/50 bg-background-primary/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Icons.Cloud className="w-5 h-5 text-foreground-on-secondary" />
            </div>
            <span className="text-lg font-black uppercase tracking-tighter">Weather</span>
          </div>
          
          <div className="flex items-center gap-2 bg-foreground-tertiary/10 rounded-full p-1">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCityId(city.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCityId === city.id
                    ? 'bg-foreground-primary text-foreground-on-secondary'
                    : 'text-foreground-secondary hover:text-foreground-primary hover:bg-foreground-tertiary/10'
                }`}
              >
                {city.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground-tertiary/10 hover:bg-foreground-tertiary/20 text-xs font-bold transition-all"
          >
            °{unit}
          </button>
          <button
            onClick={() => setShowHourly(!showHourly)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              showHourly ? 'bg-accent text-foreground-on-secondary' : 'bg-foreground-tertiary/10 text-foreground-secondary'
            }`}
          >
            <Icons.Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Current Weather & Main Metrics */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Card */}
            <div className="relative overflow-hidden bg-background-secondary rounded-[32px] p-10 border border-stroke-primary/50">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -mr-20 -mt-20" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Icons.MapPin className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">{currentWeather.location}</span>
                  </div>
                  <h1 className="text-8xl font-black tracking-tighter leading-none">
                    {convertTemp(currentWeather.temp)}°
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold opacity-90">{currentWeather.condition}</span>
                    <div className="px-3 py-1 bg-foreground-tertiary/10 rounded-full text-xs font-bold text-foreground-secondary">
                      Feels like {convertTemp(currentWeather.feelsLike)}°
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150" />
                    {getWeatherIcon('cloud-sun', 'w-48 h-48 relative z-10')}
                  </div>
                </div>
              </div>

              {/* Quick Summary Row */}
              <div className="mt-12 pt-10 border-t border-stroke-primary/50 flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground-tertiary/10 flex items-center justify-center">
                    <Icons.Sunrise className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-foreground-tertiary tracking-wider">Sunrise</p>
                    <p className="font-bold">{currentWeather.sunrise}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground-tertiary/10 flex items-center justify-center">
                    <Icons.Sunset className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-foreground-tertiary tracking-wider">Sunset</p>
                    <p className="font-bold">{currentWeather.sunset}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground-tertiary/10 flex items-center justify-center">
                    <Icons.Gauge className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-foreground-tertiary tracking-wider">Pressure</p>
                    <p className="font-bold">{currentWeather.pressure} mb</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CircularMetric label="Humidity" value={currentWeather.humidity} max={100} icon={Icons.Droplets} suffix="%" />
              <CircularMetric label="UV Index" value={currentWeather.uvIndex} max={12} icon={Icons.Sun} />
              <CircularMetric label="Wind" value={currentWeather.wind} max={100} icon={Icons.Wind} suffix="km" />
              <CircularMetric label="Visibility" value={currentWeather.visibility} max={20} icon={Icons.Eye} suffix="km" />
            </div>

            {/* Hourly Forecast */}
            <AnimatePresence>
              {showHourly && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-background-secondary rounded-[32px] p-8 border border-stroke-primary/50"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Icons.Clock className="w-5 h-5 text-accent" />
                      Hourly Timeline
                    </h3>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {selectedCity.hourly.map((hour, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-4 bg-foreground-tertiary/5 hover:bg-foreground-tertiary/10 border border-stroke-primary/50 rounded-2xl p-6 min-w-[110px] transition-all"
                      >
                        <span className="text-xs font-bold opacity-40">{hour.time}</span>
                        {getWeatherIcon(hour.icon, 'w-10 h-10')}
                        <span className="text-xl font-black">{convertTemp(hour.temp)}°</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: 5-Day Forecast & Status */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Forecast Card */}
            <div className="bg-background-secondary rounded-[32px] p-8 border border-stroke-primary/50 flex flex-col h-full">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-8">
                <Icons.Calendar className="w-5 h-5 text-accent" />
                Next 5 Days
              </h3>
              <div className="space-y-4 flex-1">
                {selectedCity.forecast.map((day, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between bg-foreground-tertiary/5 hover:bg-foreground-tertiary/10 border border-stroke-primary/50 rounded-2xl p-5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 text-sm font-black opacity-40 uppercase">{day.day}</div>
                      {getWeatherIcon(day.icon, 'w-6 h-6')}
                    </div>
                    <div className="flex items-center gap-6">
                      {day.precipitation > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400">
                          <Icons.Droplets className="w-3 h-3" />
                          {day.precipitation}%
                        </div>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span className="font-black">{convertTemp(day.high)}°</span>
                        <span className="opacity-30">{convertTemp(day.low)}°</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Bottom Decoration/Status */}
              <div className="mt-8 pt-8 border-t border-stroke-primary/50">
                <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Icons.Zap className="w-6 h-6 text-foreground-on-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-accent">Orion Insight</p>
                    <p className="text-[11px] font-bold text-foreground-secondary leading-tight">High solar potential today. Optimal for outdoor energy-intensive activities.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-bg-accent-hover);
        }
      `}</style>
    </div>
  );
}
