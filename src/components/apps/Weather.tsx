import * as Icons from 'lucide-react';

export function Weather() {
  const currentWeather = {
    temp: 24,
    condition: 'Partly Cloudy',
    location: 'Johannesburg, SA',
    humidity: 45,
    wind: 12,
    feelsLike: 22,
  };

  const forecast = [
    { day: 'Mon', high: 26, low: 18, icon: 'sun' },
    { day: 'Tue', high: 28, low: 19, icon: 'sun' },
    { day: 'Wed', high: 25, low: 17, icon: 'cloud' },
    { day: 'Thu', high: 23, low: 16, icon: 'cloud-rain' },
    { day: 'Fri', high: 27, low: 18, icon: 'sun' },
  ];

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun': return <Icons.Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloud': return <Icons.Cloud className="w-8 h-8 text-gray-400" />;
      case 'cloud-rain': return <Icons.CloudRain className="w-8 h-8 text-primary-400" />;
      default: return <Icons.CloudSun className="w-8 h-8 text-yellow-400" />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 backdrop-blur-xl p-6 overflow-y-auto">
      <div className="text-white">
        <div className="flex items-center gap-2 mb-6">
          <Icons.MapPin className="w-5 h-5" />
          <h2 className="text-xl font-semibold">{currentWeather.location}</h2>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-6xl font-bold mb-2">{currentWeather.temp}°</div>
              <div className="text-xl opacity-90">{currentWeather.condition}</div>
              <div className="text-sm opacity-75 mt-1">Feels like {currentWeather.feelsLike}°</div>
            </div>
            <Icons.CloudSun className="w-24 h-24 opacity-90" />
          </div>

          {/* Gradient divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Icons.Droplets className="w-5 h-5 opacity-75" />
              <div>
                <div className="text-sm opacity-75">Humidity</div>
                <div className="font-semibold">{currentWeather.humidity}%</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icons.Wind className="w-5 h-5 opacity-75" />
              <div>
                <div className="text-sm opacity-75">Wind</div>
                <div className="font-semibold">{currentWeather.wind} km/h</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded p-6">
          <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
          <div className="space-y-3">
            {forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="w-12 font-medium">{day.day}</div>
                <div className="flex-1 flex items-center justify-center">
                  {getWeatherIcon(day.icon)}
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="font-semibold">{day.high}°</span>
                  <span className="opacity-75">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
