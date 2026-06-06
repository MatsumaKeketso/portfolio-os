import type { ComponentType } from 'react';
import {
  // Files & Storage
  Folder, FolderOpen, FolderUser, FolderPlus, File, FileText, Article, Note,
  FilePdf, Image, FileVideo, FileAudio, Cloud, CloudArrowUp, CloudArrowDown,
  HardDrives, Database,
  // Code & Tech
  Code, Terminal, DeviceMobile, PuzzlePiece, Bug, Plugs, PlugsConnected,
  GithubLogo, Cpu, Desktop, Graph, Robot, AndroidLogo,
  // Communication
  Envelope, Phone, ChatCircle, ChatText, ChatCircleDots, ChatsCircle,
  ChatTeardropText, Bell, ShareNetwork, LinkSimple, QrCode, At,
  // People
  User, Users, UsersThree, UserCircle, UserPlus, UserGear,
  IdentificationBadge, IdentificationCard, Briefcase,
  // Navigation
  House, MagnifyingGlass, Gear, Info, Question, List, SquaresFour, Compass,
  ArrowSquareOut, Globe, GlobeHemisphereWest, MapTrifold, MapPin, Airplane,
  // Interaction
  Star, Heart, BookmarkSimple, ThumbsUp, Trophy, Confetti,
  // Media
  Play, Pause, MusicNotes, FilmSlate, VideoCamera, Camera, Images, Microphone,
  Headphones, Television, Radio, MicrophoneStage, MaskHappy,
  // Design
  Palette, PaintBrush, Eyedropper, StackSimple, PencilSimple, Sparkle, Sliders,
  PaintBucket, FilmStrip,
  // Analytics & Business
  ChartLine, ChartBar, TrendUp, ChartPie, ClipboardText, ChartLineUp,
  CurrencyCircleDollar, ShoppingCart, Storefront, CreditCard, Package,
  // Education
  GraduationCap, BookOpen, Books, Flask, Brain, Lightbulb,
  // Tools & Other
  Wrench, Hammer, GearSix, Lightning, GameController, Rocket, RocketLaunch,
  // Files/Docs extras
  FilePlus, Copy, Archive, Clipboard, DownloadSimple, UploadSimple, Newspaper, Rss,
  // Devices extras
  Laptop, Monitor, WifiHigh, Printer, BluetoothConnected, Watch, Devices,
  // People extras
  AddressBook, Megaphone, Smiley,
  // Navigation/UI extras
  ListBullets, Table, FunnelSimple,
  // Media extras
  MonitorPlay, Disc, SpeakerHigh, Shuffle, Repeat, BroadcastIcon,
  // Design extras
  MagicWand, ArrowsClockwise, FrameCorners, MagnifyingGlassPlus, MagnifyingGlassMinus, Crop,
  // Business extras
  Bank, Wallet, Receipt, Truck, Cube,
  // Security
  ShieldCheck, Lock, LockOpen, SealCheck, Shield, ShieldWarning, Key, ShieldStar,
  // Time / Calendar
  CalendarBlank, CalendarCheck, Clock, Timer, CalendarDots, Alarm,
  // Health & Lifestyle
  Heartbeat, FirstAidKit, Barbell, PersonSimpleTaiChi, SoccerBall, Coffee, Sun, Tree, Plant,
  Car, Train, AirplaneTakeoff,
} from '@phosphor-icons/react';

// Phosphor icon components accept `size`, `weight`, `color` and render with
// `currentColor` by default — so they recolor with `text-*` / brand tokens.
export type PhosphorIconComponent = ComponentType<{
  className?: string;
  style?: React.CSSProperties;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}>;

// Keyed by stable display names. These names are the catalog's contract — the
// category lists and any stored `ph:<Name>` references resolve against them, so
// the underlying Phosphor component can change without breaking saved icons.
export const phosphorIconCatalog: Record<string, PhosphorIconComponent> = {
  // Files & Storage
  Folder, FolderOpen, FolderShared: FolderUser, CreateNewFolder: FolderPlus,
  InsertDriveFile: File, Description: FileText, Article, Assignment: Note,
  PictureAsPdf: FilePdf, Image, VideoFile: FileVideo, AudioFile: FileAudio,
  Cloud, CloudUpload: CloudArrowUp, CloudDownload: CloudArrowDown,
  Storage: HardDrives, DataObject: Database,
  // Code & Tech
  Code, Terminal, DeveloperMode: DeviceMobile, IntegrationInstructions: PuzzlePiece,
  BugReport: Bug, Api: Plugs, Webhook: PlugsConnected, GitHub: GithubLogo,
  Memory: Cpu, Computer: Desktop, Dns: Database, Hub: Graph,
  SmartToy: Robot, Android: AndroidLogo, PhoneIphone: DeviceMobile,
  // Communication
  Email: Envelope, Phone, Chat: ChatCircle, Message: ChatText, Sms: ChatCircleDots,
  Forum: ChatsCircle, Comment: ChatTeardropText, Notifications: Bell,
  Share: ShareNetwork, Link: LinkSimple, QrCode, AlternateEmail: At,
  // People
  Person: User, People: Users, Group: UsersThree, AccountCircle: UserCircle,
  PersonAdd: UserPlus, ManageAccounts: UserGear, Badge: IdentificationBadge,
  ContactPage: IdentificationCard, Work: Briefcase, BusinessCenter: Briefcase,
  // Navigation
  Home: House, Search: MagnifyingGlass, Settings: Gear, Info, Help: Question,
  Menu: List, Apps: SquaresFour, Dashboard: SquaresFour, Explore: Compass,
  OpenInNew: ArrowSquareOut, Language: Globe, Public: GlobeHemisphereWest,
  Map: MapTrifold, LocationOn: MapPin, Flight: Airplane,
  // Interaction
  Star, Favorite: Heart, Bookmark: BookmarkSimple, ThumbUp: ThumbsUp,
  EmojiEvents: Trophy, Celebration: Confetti,
  // Media
  PlayArrow: Play, Pause, MusicNote: MusicNotes, Movie: FilmSlate, Videocam: VideoCamera,
  PhotoCamera: Camera, Collections: Images, Mic: Microphone, Headphones,
  Tv: Television, Radio, Podcasts: MicrophoneStage, TheaterComedy: MaskHappy,
  // Design
  Palette, Brush: PaintBrush, ColorLens: Eyedropper, Layers: StackSimple,
  Style: PencilSimple, Draw: PencilSimple, AutoAwesome: Sparkle, Tune: Sliders,
  Wallpaper: Image, Edit: PencilSimple, FormatPaint: PaintBucket, Animation: FilmStrip,
  // Analytics & Business
  Analytics: ChartLine, BarChart: ChartBar, ShowChart: ChartLine, TrendingUp: TrendUp,
  PieChart: ChartPie, Assessment: ClipboardText, Timeline: ChartLineUp,
  MonetizationOn: CurrencyCircleDollar, ShoppingCart, Store: Storefront,
  Payment: CreditCard, Inventory: Package,
  // Education
  School: GraduationCap, MenuBook: BookOpen, LibraryBooks: Books, Science: Flask,
  Psychology: Brain, Lightbulb, EmojiObjects: Lightbulb,
  // Tools & Other
  Build: Wrench, Construction: Hammer, Engineering: GearSix, Biotech: Flask,
  FlashOn: Lightning, Bolt: Lightning, Extension: PuzzlePiece, Widgets: SquaresFour,
  SportsEsports: GameController, Rocket, RocketLaunch,
  // Files/Docs extras
  NoteAdd: FilePlus, FileCopy: Copy, Archive, ContentCopy: Copy, ContentPaste: Clipboard,
  FileDownload: DownloadSimple, FileUpload: UploadSimple, Download: DownloadSimple,
  Upload: UploadSimple, Newspaper, RssFeed: Rss,
  // Devices extras
  Laptop, LaptopMac: Laptop, Monitor, Router: WifiHigh, Print: Printer,
  Bluetooth: BluetoothConnected, Wifi: WifiHigh, SdCard: HardDrives, Usb: Plugs,
  Watch, Devices,
  // People extras
  Groups: UsersThree, Diversity3: UsersThree, ContactMail: AddressBook,
  Contacts: AddressBook, VideoCall: VideoCamera, RecordVoiceOver: Megaphone,
  Campaign: Megaphone, Face: Smiley,
  // Navigation/UI extras
  GridView: SquaresFour, ViewList: ListBullets, ViewModule: SquaresFour,
  TableChart: Table, TableRows: Table, SpaceDashboard: SquaresFour,
  Launch: ArrowSquareOut, FilterList: FunnelSimple, Sort: FunnelSimple,
  // Media extras
  OndemandVideo: MonitorPlay, LiveTv: MonitorPlay, PhotoLibrary: Images, Album: Disc,
  LibraryMusic: MusicNotes, VolumeUp: SpeakerHigh, Shuffle, Repeat, CastConnected: BroadcastIcon,
  // Design extras
  AutoFixHigh: MagicWand, Transform: ArrowsClockwise, AspectRatio: FrameCorners,
  RotateRight: ArrowsClockwise, ZoomIn: MagnifyingGlassPlus, ZoomOut: MagnifyingGlassMinus,
  CropOriginal: Crop, Crop,
  // Business extras
  CreditCard, AccountBalance: Bank, AccountBalanceWallet: Wallet, Receipt,
  LocalShipping: Truck, Category: Cube, AutoGraph: ChartLineUp, Workspaces: SquaresFour,
  Interests: Cube,
  // Security
  Security: ShieldCheck, Lock, LockOpen, Verified: SealCheck, Shield,
  PrivacyTip: ShieldWarning, VpnKey: Key, AdminPanelSettings: ShieldStar, GppGood: ShieldCheck,
  // Time / Calendar
  CalendarMonth: CalendarBlank, Today: CalendarCheck, Schedule: Clock, Timer,
  AccessTime: Clock, DateRange: CalendarDots, AlarmOn: Alarm,
  // Health & Lifestyle
  MonitorHeart: Heartbeat, HealthAndSafety: FirstAidKit, MedicalServices: FirstAidKit,
  FitnessCenter: Barbell, SelfImprovement: PersonSimpleTaiChi, SportsSoccer: SoccerBall,
  LocalCafe: Coffee, WbSunny: Sun, Park: Tree, EmojiNature: Plant,
  FlightTakeoff: AirplaneTakeoff, DirectionsCar: Car, Train,
};

export interface PhosphorIconCategory {
  label: string;
  names: string[];
}

export const phosphorIconCategories: PhosphorIconCategory[] = [
  { label: 'Files', names: ['Folder','FolderOpen','FolderShared','CreateNewFolder','InsertDriveFile','Description','Article','Assignment','PictureAsPdf','Image','VideoFile','AudioFile','Cloud','CloudUpload','CloudDownload','Storage','DataObject'] },
  { label: 'Code', names: ['Code','Terminal','DeveloperMode','IntegrationInstructions','BugReport','Api','Webhook','GitHub','Memory','Computer','Dns','Hub','SmartToy','Android','PhoneIphone'] },
  { label: 'People', names: ['Person','People','Group','AccountCircle','PersonAdd','ManageAccounts','Badge','ContactPage','Work','BusinessCenter'] },
  { label: 'Communication', names: ['Email','Phone','Chat','Message','Sms','Forum','Comment','Notifications','Share','Link','QrCode','AlternateEmail'] },
  { label: 'Navigation', names: ['Home','Search','Settings','Info','Help','Menu','Apps','Dashboard','Explore','OpenInNew','Language','Public','Map','LocationOn','Flight'] },
  { label: 'Media', names: ['PlayArrow','Pause','MusicNote','Movie','Videocam','PhotoCamera','Collections','Mic','Headphones','Tv','Radio','Podcasts','TheaterComedy'] },
  { label: 'Design', names: ['Palette','Brush','ColorLens','Layers','Style','Draw','AutoAwesome','Tune','Wallpaper','Edit','FormatPaint','Animation'] },
  { label: 'Analytics', names: ['Analytics','BarChart','ShowChart','TrendingUp','PieChart','Assessment','Timeline','MonetizationOn','ShoppingCart','Store','Payment','Inventory'] },
  { label: 'Education', names: ['School','MenuBook','LibraryBooks','Science','Psychology','Lightbulb','EmojiObjects','SportsEsports'] },
  { label: 'Social', names: ['Star','Favorite','Bookmark','ThumbUp','EmojiEvents','Celebration'] },
  { label: 'Tools', names: ['Build','Construction','Engineering','Biotech','FlashOn','Bolt','Extension','Widgets','SportsEsports','Rocket','RocketLaunch'] },
  { label: 'Devices', names: ['Laptop','LaptopMac','Monitor','Router','Print','Bluetooth','Wifi','SdCard','Usb','Watch','Devices','Computer','Memory','PhoneIphone','Android'] },
  { label: 'Security', names: ['Security','Lock','LockOpen','Verified','Shield','PrivacyTip','VpnKey','AdminPanelSettings','GppGood'] },
  { label: 'Time', names: ['CalendarMonth','Today','Schedule','Timer','AccessTime','DateRange','AlarmOn'] },
  { label: 'Health', names: ['MonitorHeart','HealthAndSafety','MedicalServices','FitnessCenter','SelfImprovement','Psychology','SportsSoccer'] },
  { label: 'Lifestyle', names: ['LocalCafe','WbSunny','Park','EmojiNature','FlightTakeoff','DirectionsCar','Train','Face','Interests','EmojiObjects'] },
  { label: 'UI', names: ['GridView','ViewList','ViewModule','TableChart','TableRows','SpaceDashboard','FilterList','Sort','Launch','Download','Upload','ContentCopy','ContentPaste'] },
];

export const phosphorIconNames = Object.keys(phosphorIconCatalog);
