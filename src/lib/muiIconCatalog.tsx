import type { ComponentType } from 'react';

// Explicit named imports — only these icons are bundled
import Folder from '@mui/icons-material/Folder';
import FolderOpen from '@mui/icons-material/FolderOpen';
import FolderShared from '@mui/icons-material/FolderShared';
import CreateNewFolder from '@mui/icons-material/CreateNewFolder';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import Description from '@mui/icons-material/Description';
import Article from '@mui/icons-material/Article';
import Assignment from '@mui/icons-material/Assignment';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import Image from '@mui/icons-material/Image';
import VideoFile from '@mui/icons-material/VideoFile';
import AudioFile from '@mui/icons-material/AudioFile';
import Cloud from '@mui/icons-material/Cloud';
import CloudUpload from '@mui/icons-material/CloudUpload';
import CloudDownload from '@mui/icons-material/CloudDownload';
import Storage from '@mui/icons-material/Storage';
import DataObject from '@mui/icons-material/DataObject';

import Code from '@mui/icons-material/Code';
import Terminal from '@mui/icons-material/Terminal';
import DeveloperMode from '@mui/icons-material/DeveloperMode';
import IntegrationInstructions from '@mui/icons-material/IntegrationInstructions';
import BugReport from '@mui/icons-material/BugReport';
import Api from '@mui/icons-material/Api';
import Webhook from '@mui/icons-material/Webhook';
import GitHub from '@mui/icons-material/GitHub';
import Memory from '@mui/icons-material/Memory';
import Computer from '@mui/icons-material/Computer';
import Dns from '@mui/icons-material/Dns';
import Hub from '@mui/icons-material/Hub';
import SmartToy from '@mui/icons-material/SmartToy';
import Android from '@mui/icons-material/Android';
import PhoneIphone from '@mui/icons-material/PhoneIphone';

import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import Chat from '@mui/icons-material/Chat';
import Message from '@mui/icons-material/Message';
import Sms from '@mui/icons-material/Sms';
import Forum from '@mui/icons-material/Forum';
import Comment from '@mui/icons-material/Comment';
import Notifications from '@mui/icons-material/Notifications';
import Share from '@mui/icons-material/Share';
import Link from '@mui/icons-material/Link';
import QrCode from '@mui/icons-material/QrCode';
import AlternateEmail from '@mui/icons-material/AlternateEmail';

import Person from '@mui/icons-material/Person';
import People from '@mui/icons-material/People';
import Group from '@mui/icons-material/Group';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PersonAdd from '@mui/icons-material/PersonAdd';
import ManageAccounts from '@mui/icons-material/ManageAccounts';
import Badge from '@mui/icons-material/Badge';
import ContactPage from '@mui/icons-material/ContactPage';
import Work from '@mui/icons-material/Work';
import BusinessCenter from '@mui/icons-material/BusinessCenter';

import Home from '@mui/icons-material/Home';
import Search from '@mui/icons-material/Search';
import Settings from '@mui/icons-material/Settings';
import Info from '@mui/icons-material/Info';
import Help from '@mui/icons-material/Help';
import Menu from '@mui/icons-material/Menu';
import Apps from '@mui/icons-material/Apps';
import Dashboard from '@mui/icons-material/Dashboard';
import Explore from '@mui/icons-material/Explore';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Language from '@mui/icons-material/Language';
import Public from '@mui/icons-material/Public';
import Map from '@mui/icons-material/Map';
import LocationOn from '@mui/icons-material/LocationOn';
import Flight from '@mui/icons-material/Flight';

import Star from '@mui/icons-material/Star';
import Favorite from '@mui/icons-material/Favorite';
import Bookmark from '@mui/icons-material/Bookmark';
import ThumbUp from '@mui/icons-material/ThumbUp';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Celebration from '@mui/icons-material/Celebration';

import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import MusicNote from '@mui/icons-material/MusicNote';
import Movie from '@mui/icons-material/Movie';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Collections from '@mui/icons-material/Collections';
import Mic from '@mui/icons-material/Mic';
import Headphones from '@mui/icons-material/Headphones';
import Tv from '@mui/icons-material/Tv';
import Radio from '@mui/icons-material/Radio';
import Podcasts from '@mui/icons-material/Podcasts';
import TheaterComedy from '@mui/icons-material/TheaterComedy';
import Videocam from '@mui/icons-material/Videocam';

import Palette from '@mui/icons-material/Palette';
import Brush from '@mui/icons-material/Brush';
import ColorLens from '@mui/icons-material/ColorLens';
import Layers from '@mui/icons-material/Layers';
import Style from '@mui/icons-material/Style';
import Draw from '@mui/icons-material/Draw';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Tune from '@mui/icons-material/Tune';
import Wallpaper from '@mui/icons-material/Wallpaper';
import Edit from '@mui/icons-material/Edit';
import FormatPaint from '@mui/icons-material/FormatPaint';
import Animation from '@mui/icons-material/Animation';

import Analytics from '@mui/icons-material/Analytics';
import BarChart from '@mui/icons-material/BarChart';
import ShowChart from '@mui/icons-material/ShowChart';
import TrendingUp from '@mui/icons-material/TrendingUp';
import PieChart from '@mui/icons-material/PieChart';
import Assessment from '@mui/icons-material/Assessment';
import Timeline from '@mui/icons-material/Timeline';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Store from '@mui/icons-material/Store';
import Payment from '@mui/icons-material/Payment';
import Inventory from '@mui/icons-material/Inventory';

import School from '@mui/icons-material/School';
import MenuBook from '@mui/icons-material/MenuBook';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import Science from '@mui/icons-material/Science';
import Psychology from '@mui/icons-material/Psychology';
import Lightbulb from '@mui/icons-material/Lightbulb';
import EmojiObjects from '@mui/icons-material/EmojiObjects';

import Build from '@mui/icons-material/Build';
import Construction from '@mui/icons-material/Construction';
import Engineering from '@mui/icons-material/Engineering';
import Biotech from '@mui/icons-material/Biotech';
import FlashOn from '@mui/icons-material/FlashOn';
import Bolt from '@mui/icons-material/Bolt';
import Extension from '@mui/icons-material/Extension';
import Widgets from '@mui/icons-material/Widgets';
import SportsEsports from '@mui/icons-material/SportsEsports';

// Files/Docs extras
import NoteAdd from '@mui/icons-material/NoteAdd';
import FileCopy from '@mui/icons-material/FileCopy';
import Archive from '@mui/icons-material/Archive';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import FileDownload from '@mui/icons-material/FileDownload';
import FileUpload from '@mui/icons-material/FileUpload';
import Download from '@mui/icons-material/Download';
import Upload from '@mui/icons-material/Upload';
import Newspaper from '@mui/icons-material/Newspaper';
import RssFeed from '@mui/icons-material/RssFeed';

// Devices extras
import Laptop from '@mui/icons-material/Laptop';
import LaptopMac from '@mui/icons-material/LaptopMac';
import Monitor from '@mui/icons-material/Monitor';
import Router from '@mui/icons-material/Router';
import Print from '@mui/icons-material/Print';
import Bluetooth from '@mui/icons-material/Bluetooth';
import Wifi from '@mui/icons-material/Wifi';
import SdCard from '@mui/icons-material/SdCard';
import Usb from '@mui/icons-material/Usb';
import Watch from '@mui/icons-material/Watch';
import Devices from '@mui/icons-material/Devices';

// People extras
import Groups from '@mui/icons-material/Groups';
import Diversity3 from '@mui/icons-material/Diversity3';
import ContactMail from '@mui/icons-material/ContactMail';
import Contacts from '@mui/icons-material/Contacts';
import VideoCall from '@mui/icons-material/VideoCall';
import RecordVoiceOver from '@mui/icons-material/RecordVoiceOver';
import Campaign from '@mui/icons-material/Campaign';
import Face from '@mui/icons-material/Face';

// Navigation / UI extras
import GridView from '@mui/icons-material/GridView';
import ViewList from '@mui/icons-material/ViewList';
import ViewModule from '@mui/icons-material/ViewModule';
import TableChart from '@mui/icons-material/TableChart';
import TableRows from '@mui/icons-material/TableRows';
import SpaceDashboard from '@mui/icons-material/SpaceDashboard';
import Launch from '@mui/icons-material/Launch';
import FilterList from '@mui/icons-material/FilterList';
import Sort from '@mui/icons-material/Sort';

// Media extras
import OndemandVideo from '@mui/icons-material/OndemandVideo';
import LiveTv from '@mui/icons-material/LiveTv';
import PhotoLibrary from '@mui/icons-material/PhotoLibrary';
import Album from '@mui/icons-material/Album';
import LibraryMusic from '@mui/icons-material/LibraryMusic';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Shuffle from '@mui/icons-material/Shuffle';
import Repeat from '@mui/icons-material/Repeat';
import CastConnected from '@mui/icons-material/CastConnected';

// Design extras
import AutoFixHigh from '@mui/icons-material/AutoFixHigh';
import Transform from '@mui/icons-material/Transform';
import AspectRatio from '@mui/icons-material/AspectRatio';
import RotateRight from '@mui/icons-material/RotateRight';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import CropOriginal from '@mui/icons-material/CropOriginal';
import Crop from '@mui/icons-material/Crop';

// Business extras
import CreditCard from '@mui/icons-material/CreditCard';
import AccountBalance from '@mui/icons-material/AccountBalance';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Receipt from '@mui/icons-material/Receipt';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Category from '@mui/icons-material/Category';
import AutoGraph from '@mui/icons-material/AutoGraph';
import Workspaces from '@mui/icons-material/Workspaces';
import Interests from '@mui/icons-material/Interests';

// Security
import Security from '@mui/icons-material/Security';
import Lock from '@mui/icons-material/Lock';
import LockOpen from '@mui/icons-material/LockOpen';
import Verified from '@mui/icons-material/Verified';
import Shield from '@mui/icons-material/Shield';
import PrivacyTip from '@mui/icons-material/PrivacyTip';
import VpnKey from '@mui/icons-material/VpnKey';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import GppGood from '@mui/icons-material/GppGood';

// Time / Calendar
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Today from '@mui/icons-material/Today';
import Schedule from '@mui/icons-material/Schedule';
import Timer from '@mui/icons-material/Timer';
import AccessTime from '@mui/icons-material/AccessTime';
import DateRange from '@mui/icons-material/DateRange';
import AlarmOn from '@mui/icons-material/AlarmOn';

// Health & Lifestyle
import MonitorHeart from '@mui/icons-material/MonitorHeart';
import HealthAndSafety from '@mui/icons-material/HealthAndSafety';
import MedicalServices from '@mui/icons-material/MedicalServices';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import SelfImprovement from '@mui/icons-material/SelfImprovement';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import LocalCafe from '@mui/icons-material/LocalCafe';
import WbSunny from '@mui/icons-material/WbSunny';
import Park from '@mui/icons-material/Park';
import EmojiNature from '@mui/icons-material/EmojiNature';
import Rocket from '@mui/icons-material/Rocket';
import RocketLaunch from '@mui/icons-material/RocketLaunch';
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';
import DirectionsCar from '@mui/icons-material/DirectionsCar';

export type MuiIconComponent = ComponentType<{ className?: string; style?: React.CSSProperties }>;

export const muiIconCatalog: Record<string, MuiIconComponent> = {
  // Files & Storage
  Folder, FolderOpen, FolderShared, CreateNewFolder,
  InsertDriveFile, Description, Article, Assignment,
  PictureAsPdf, Image, VideoFile, AudioFile,
  Cloud, CloudUpload, CloudDownload, Storage, DataObject,
  // Code & Tech
  Code, Terminal, DeveloperMode, IntegrationInstructions,
  BugReport, Api, Webhook, GitHub,
  Memory, Computer, Dns, Hub,
  SmartToy, Android, PhoneIphone,
  // Communication
  Email, Phone, Chat, Message, Sms,
  Forum, Comment, Notifications, Share, Link, QrCode, AlternateEmail,
  // People
  Person, People, Group, AccountCircle,
  PersonAdd, ManageAccounts, Badge, ContactPage, Work, BusinessCenter,
  // Navigation
  Home, Search, Settings, Info, Help, Menu,
  Apps, Dashboard, Explore, OpenInNew,
  Language, Public, Map, LocationOn, Flight,
  // Interaction
  Star, Favorite, Bookmark, ThumbUp, EmojiEvents, Celebration,
  // Media
  PlayArrow, Pause, MusicNote, Movie, Videocam,
  PhotoCamera, Collections, Mic, Headphones,
  Tv, Radio, Podcasts, TheaterComedy,
  // Design
  Palette, Brush, ColorLens, Layers, Style, Draw,
  AutoAwesome, Tune, Wallpaper, Edit, FormatPaint, Animation,
  // Analytics & Business
  Analytics, BarChart, ShowChart, TrendingUp,
  PieChart, Assessment, Timeline, MonetizationOn,
  ShoppingCart, Store, Payment, Inventory,
  // Education
  School, MenuBook, LibraryBooks, Science,
  Psychology, Lightbulb, EmojiObjects,
  // Tools & Other
  Build, Construction, Engineering, Biotech,
  FlashOn, Bolt, Extension, Widgets, SportsEsports,
  // Files/Docs extras
  NoteAdd, FileCopy, Archive, ContentCopy, ContentPaste,
  FileDownload, FileUpload, Download, Upload, Newspaper, RssFeed,
  // Devices extras
  Laptop, LaptopMac, Monitor, Router, Print, Bluetooth, Wifi, SdCard, Usb, Watch, Devices,
  // People extras
  Groups, Diversity3, ContactMail, Contacts, VideoCall, RecordVoiceOver, Campaign, Face,
  // Navigation/UI extras
  GridView, ViewList, ViewModule, TableChart, TableRows, SpaceDashboard, Launch, FilterList, Sort,
  // Media extras
  OndemandVideo, LiveTv, PhotoLibrary, Album, LibraryMusic, VolumeUp, Shuffle, Repeat, CastConnected,
  // Design extras
  AutoFixHigh, Transform, AspectRatio, RotateRight, ZoomIn, ZoomOut, CropOriginal, Crop,
  // Business extras
  CreditCard, AccountBalance, AccountBalanceWallet, Receipt, LocalShipping, Category, AutoGraph, Workspaces, Interests,
  // Security
  Security, Lock, LockOpen, Verified, Shield, PrivacyTip, VpnKey, AdminPanelSettings, GppGood,
  // Time/Calendar
  CalendarMonth, Today, Schedule, Timer, AccessTime, DateRange, AlarmOn,
  // Health & Lifestyle
  MonitorHeart, HealthAndSafety, MedicalServices, FitnessCenter, SelfImprovement,
  SportsSoccer, LocalCafe, WbSunny, Park, EmojiNature,
  Rocket, RocketLaunch, FlightTakeoff, DirectionsCar,
};

export interface MuiIconCategory {
  label: string;
  names: string[];
}

export const muiIconCategories: MuiIconCategory[] = [
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
  { label: 'Health', names: ['MonitorHeart','HealthAndSafety','MedicalServices','FitnessCenter','SelfImprovement','Psychology','SportsEsports','SportsSoccer'] },
  { label: 'Lifestyle', names: ['LocalCafe','WbSunny','Park','EmojiNature','FlightTakeoff','DirectionsCar','Train','Face','Interests','EmojiObjects'] },
  { label: 'UI', names: ['GridView','ViewList','ViewModule','TableChart','TableRows','SpaceDashboard','FilterList','Sort','Launch','Download','Upload','ContentCopy','ContentPaste'] },
];

export const muiIconNames = Object.keys(muiIconCatalog);
