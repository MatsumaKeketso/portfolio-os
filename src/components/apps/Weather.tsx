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
        return <Icons.Sun className={`${iconClass} text-yellow-500 animate-pulse`} />;
      case 'cloud':
        return <Icons.Cloud className={`${iconClass} text-gray-400`} />;
      case 'cloud-rain':
        return <Icons.CloudRain className={`${iconClass} text-blue-400`} />;
      case 'cloud-sun':
        return <Icons.CloudSun className={`${iconClass} text-yellow-400`} />;
      case 'moon':
        return <Icons.Moon className={`${iconClass} text-blue-200`} />;
      default:
        return <Icons.CloudSun className={`${iconClass} text-yellow-400`} />;
    }
  };

  const getUVLevel = (uvIndex: number): { level: string; color: string } => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-400' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-400' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-400' };
    return { level: 'Very High', color: 'text-red-400' };
  };

  const removeCity = (cityId: string) => {
    if (cities.length === 1) return;
    const newCities = cities.filter(c => c.id !== cityId);
    setCities(newCities);
    if (selectedCityId === cityId) {
      setSelectedCityId(newCities[0].id);
    }
  };

  const uvLevel = getUVLevel(currentWeather.uvIndex);

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 backdrop-blur-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-3 flex items-center gap-2 backdrop-blur-sm bg-white/5">
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {cities.map((city) => (
            <motion.button
              key={city.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedCityId(city.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCityId === city.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              <Icons.MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm">{city.name.split(',')[0]}</span>
              {cities.length > 1 && selectedCityId === city.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCity(city.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded p-0.5 transition-all"
                >
                  <Icons.X className="w-3 h-3" />
                </button>
              )}
            </motion.button>
          ))}
        </div>

        <div className="h-6 w-px bg-white/20" />

        <button
          onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
          className="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-semibold transition-all"
          title="Toggle unit"
        >
          °{unit}
        </button>

        <button
          onClick={() => setShowHourly(!showHourly)}
          className={`px-2 py-1.5 rounded text-xs font-semibold transition-all ${
            showHourly ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
          title="Toggle hourly"
        >
          <Icons.Clock className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Current Weather */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Icons.MapPin className="w-5 h-5 text-white" />
              <h2 className="text-xl font-semibold text-white">{currentWeather.location}</h2>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div className="text-white">
                <div className="text-7xl font-bold mb-2">
                  {convertTemp(currentWeather.temp)}°
                </div>
                <div className="text-2xl opacity-90 mb-1">{currentWeather.condition}</div>
                <div className="text-sm opacity-75">
                  Feels like {convertTemp(currentWeather.feelsLike)}°
                </div>
              </div>
              <div className="flex items-center justify-center w-32 h-32">
                {getWeatherIcon('cloud-sun', 'w-32 h-32')}
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Droplets className="w-4 h-4 opacity-75" />
                  <span className="text-xs opacity-75">Humidity</span>
                </div>
                <div className="text-2xl font-bold">{currentWeather.humidity}%</div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Wind className="w-4 h-4 opacity-75" />
                  <span className="text-xs opacity-75">Wind</span>
                </div>
                <div className="text-2xl font-bold">{currentWeather.wind} km/h</div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Sun className="w-4 h-4 opacity-75" />
                  <span className="text-xs opacity-75">UV Index</span>
                </div>
                <div className="text-2xl font-bold">
                  {currentWeather.uvIndex}{' '}
                  <span className={`text-sm ${uvLevel.color}`}>{uvLevel.level}</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Eye className="w-4 h-4 opacity-75" />
                  <span className="text-xs opacity-75">Visibility</span>
                </div>
                <div className="text-2xl font-bold">{currentWeather.visibility} km</div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Gauge className="w-4 h-4 opacity-75" />
                  <span className="text-xs opacity-75">Pressure</span>
                </div>
                <div className="text-2xl font-bold">{currentWeather.pressure} mb</div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Sunrise className="w-4 h-4 opacity-75" />
                  <span className="text-xs opacity-75">Sunrise</span>
                </div>
                <div className="text-2xl font-bold">{currentWeather.sunrise}</div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Sunset className="w-4 h-4 opacity-75" />
                  <span className="text-xs opacity-75">Sunset</span>
                </div>
                <div className="text-2xl font-bold">{currentWeather.sunset}</div>
              </div>
            </div>
          </div>

          {/* Hourly Forecast */}
          <AnimatePresence>
            {showHourly && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 mb-6 overflow-hidden"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Clock className="w-5 h-5" />
                  Hourly Forecast
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {selectedCity.hourly.map((hour, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 bg-white/10 rounded-lg p-4 min-w-[80px]"
                    >
                      <span className="text-white text-sm font-medium">{hour.time}</span>
                      {getWeatherIcon(hour.icon, 'w-10 h-10')}
                      <span className="text-white text-lg font-bold">
                        {convertTemp(hour.temp)}°
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5-Day Forecast */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icons.Calendar className="w-5 h-5" />
              5-Day Forecast
            </h3>
            <div className="space-y-2">
              {selectedCity.forecast.map((day, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between bg-white/10 rounded-lg p-4 text-white hover:bg-white/20 transition-all"
                >
                  <div className="w-16 font-semibold">{day.day}</div>
                  <div className="flex-1 flex items-center gap-3">
                    {getWeatherIcon(day.icon, 'w-8 h-8')}
                    <span className="text-sm opacity-90">{day.condition}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {day.precipitation > 0 && (
                      <div className="flex items-center gap-1 text-sm opacity-75">
                        <Icons.Droplets className="w-3.5 h-3.5" />
                        {day.precipitation}%
                      </div>
                    )}
                    <div className="flex gap-3 text-sm min-w-[80px] justify-end">
                      <span className="font-bold">{convertTemp(day.high)}°</span>
                      <span className="opacity-75">{convertTemp(day.low)}°</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
