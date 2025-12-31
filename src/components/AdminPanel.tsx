import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { App } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from './ui/card';

export function AdminPanel() {
  const {
    apps, isAdminMode, addApp, removeApp, updateApp, exportConfig, importConfig,
    backgrounds, selectedBackgroundId, addBackground, removeBackground, setSelectedBackground
  } = useDesktopStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [quickURL, setQuickURL] = useState('');
  const [bulkURLs, setBulkURLs] = useState('');
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'apps' | 'backgrounds'>('apps');
  const [formData, setFormData] = useState<Partial<App>>({
    name: '',
    icon: 'square',
    type: 'component',
    component: '',
    url: '',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 50, y: 50 },
    defaultSize: { width: 800, height: 600 },
    description: ''
  });

  const iconOptions = [
    'folder', 'globe', 'calculator', 'file-text', 'cloud', 'activity', 'heart',
    'github', 'user', 'briefcase', 'code', 'terminal', 'image', 'video',
    'music', 'book', 'mail', 'phone', 'settings', 'star', 'search', 'chrome',
    'link', 'radio', 'zap', 'trello', 'figma', 'github-pages', 'shopping-cart'
  ];

  // Icon library with popular app/service icons
  const iconLibrary = [
    {
      name: 'GitHub',
      icon: 'github',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTgiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00OC44NTQgMEMyMS44MzkgMCAwIDIyIDAgNDkuMjE3YzAgMjEuNzU2IDEzLjk5MyA0MC4xNzIgMzMuNDA1IDQ2LjY5IDIuNDI3LjQ5IDMuMzE2LTEuMDU5IDMuMzE2LTIuMzYyIDAtMS4xNDEtLjA4LTUuMDUyLS4wOC05LjEyNy0xMy41OSAyLjkzNC0xNi40Mi01Ljg2Ny0xNi40Mi01Ljg2Ny0yLjE4NC01LjcwNC01LjQyLTcuMTctNS40Mi03LjE3LTQuNDQ4LTMuMDE1LjMyNC0zLjAxNS4zMjQtMy4wMTUgNC45MzQuMzI2IDcuNTIzIDUuMDUyIDcuNTIzIDUuMDUyIDQuMzY3IDcuNDk2IDExLjQwNCA1LjM3OCAxNC4yMzUgNC4wNzQuNDA0LTMuMTc4IDEuNjk5LTUuMzc4IDMuMDc0LTYuNi0xMC44MzktMS4xNDEtMjIuMjQzLTUuMzc4LTIyLjI0My0yNC4yODMgMC01LjM3OCAxLjk0LTkuNzc4IDUuMDE0LTEzLjItLjQ4NS0xLjIyMi0yLjE4NC02LjI3NS40ODYtMTMuMDM4IDAgMCA0LjEyNS0xLjMwNCAxMy40MjYgNS4wNTJhNDYuOTcgNDYuOTcgMCAwIDEgMTIuMjE0LTEuNjNjNC4xMjUgMCA4LjMzLjU3MSAxMi4yMTMgMS42MyA5LjMwMi02LjM1NiAxMy40MjctNS4wNTIgMTMuNDI3LTUuMDUyIDIuNjcgNi43NjMuOTcgMTEuODE2LjQ4NSAxMy4wMzggMy4xNTUgMy40MjIgNS4wMTUgNy44MjIgNS4wMTUgMTMuMiAwIDE4LjkwNS0xMS40MDQgMjMuMDYtMjIuMzI0IDI0LjI4MyAxLjc4IDEuNTQ4IDMuMzE2IDQuNDgxIDMuMzE2IDkuMTI2IDAgNi42LS4wOCAxMS44OTctLjA4IDEzLjUyNiAwIDEuMzA0Ljg5IDIuODUzIDMuMzE2IDIuMzY0IDE5LjQxMi02LjUyIDMzLjQwNS0yNC45MzUgMzMuNDA1LTQ2LjY5MUM5Ny43MDcgMjIgNzUuNzg4IDAgNDguODU0IDB6IiBmaWxsPSIjZmZmIi8+PC9zdmc+'
    },
    {
      name: 'LinkedIn',
      icon: 'linkedin',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYzLTIuMDY1IDIuMDY0IDIuMDY0IDAgMSAxIDIuMDYzIDIuMDY1em0xLjc4MiAxMy4wMTlIMy41NTVWOWgzLjU2NHYxMS40NTJ6TTIyLjIyNSAwSDEuNzcxQy43OTIgMCAwIC43NzQgMCAxLjcyOXYyMC41NDJDMCAyMy4yMjcuNzkyIDI0IDEuNzcxIDI0aDIwLjQ1MUMyMy4yIDI0IDI0IDIzLjIyNyAyNCAyMi4yNzFWMS43MjlDMjQgLjc3NCAyMy4yIDAgMjIuMjIyIDBoLjAwM3oiIGZpbGw9IiMwMDc3QjUiLz48L3N2Zz4='
    },
    {
      name: 'Twitter/X',
      icon: 'twitter',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE4LjkwMSAxLjE1M2gzLjY4bC04LjA0IDkuMTlMMjQgMjIuODQ2aC03LjQwNmwtNS44LTcuNTg0LTYuNjM4IDcuNTg0SC40NzRsOC42LTkuODNMMCAxLjE1NGg3LjU5NGw1LjI0MyA2LjkzMlpNMTcuNjEgMjAuNjQ0aDIuMDM5TDYuNDg2IDMuMjRINC4yOThaIiBmaWxsPSIjZmZmIi8+PC9zdmc+'
    },
    {
      name: 'YouTube',
      icon: 'youtube',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIzLjQ5OCA2LjE4NmExMy4wNjUgMTMuMDY1IDAgMCAwLTIuNTE5LTQuNzI1QzE5LjUwMi4zMjUgMTguMDg1LjA0OCAxNC44NTcgMGMtMy4yMDYuMDQ4LTQuNjIxLjMyNS02LjA5OSAxLjQ2MWExMy4wNjUgMTMuMDY1IDAgMCAwLTIuNTE5IDQuNzI1QzUuNzY4IDcuNjk0IDUuNjk1IDkuNDk5IDUuNjk1IDEyYzAgMi41MDEuMDczIDQuMzA2LjU0NCA1LjgxNGExMy4wNjUgMTMuMDY1IDAgMCAwIDIuNTE5IDQuNzI1YzEuNDc4IDEuMTM2IDIuODkzIDEuNDEzIDYuMDk5IDEuNDYxIDMuMjI4LS4wNDggNC42NDUtLjMyNSA2LjEyMS0xLjQ2MWExMy4wNjUgMTMuMDY1IDAgMCAwIDIuNTE5LTQuNzI1Yy40NzEtMS41MDguNTQ0LTMuMzEzLjU0NC01LjgxNCAwLTIuNTAxLS4wNzMtNC4zMDYtLjU0NC01LjgxNHpNOS41NDUgMTUuNTY4VjguNDMybDYuNTQ1IDMuNTY4LTYuNTQ1IDMuNTY4eiIgZmlsbD0iI0ZGMDAwMCIvPjwvc3ZnPg=='
    },
    {
      name: 'Discord',
      icon: 'message-circle',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwLjMxNyA0LjQ5MmExOS44OTEgMTkuNzkgMCAwIDAtNC45MDUtMS41MzguMTI0LjEyNCAwIDAgMC0uMTMxLjA2MmMtLjIxMS4zNzUtLjQ0NS43NjQtLjYwOCAxLjEwN2E4LjMzNiAxOC40MTcgMCAwIDAtNS41MTYgMCA2LjQ2NiAxMy4zODUgMCAwIDAtLjYxNy0xLjEwNy4xMjkuMTI5IDAgMCAwLS4xMzEtLjA2MiAxOS44MzggMTkuNzg3IDAgMCAwLTQuOTA0IDEuNTM4LjExNy4xMTcgMCAwIDAtLjA1NC4wNDZDLjM1IDguNzk4LS4yMSAxMi45NDEuMDY2IDE3LjAzOGEuMTM3LjEzNyAwIDAgMCAuMDUyLjA5NCAyMC4wNiAxOS45OSAwIDAgMCA2LjAzOCAzLjA1MS4xMy4xMyAwIDAgMCAuMTQtLjA0NmMuMzg2LS41MjcuNzMtMS4wODEgMS4wMjktMS42NThhLjEyNi4xMjYgMCAwIDAtLjA2OS0uMTc2IDEzLjE3IDEzLjA4NiAwIDAgMS0xLjg3OS0uODk1LjEyNy4xMjcgMCAwIDEtLjAxMi0uMjExYy4xMjYtLjA5NS4yNTItLjE5My4zNzMtLjI5MmEuMTI0LjEyNCAwIDAgMSAuMTMtLjAxOGM5LjkzNiA0LjUzNiAxMi40NjcgNC41MzYgMTUuNzY3IDBhLjEyNC4xMjQgMCAwIDEgLjEzMS4wMTdjLjEyLjEuMjQ3LjE5OC4zNzQuMjkzYS4xMjcuMTI3IDAgMCAxLS4wMTEuMjExIDEyLjM3IDEyLjI4OCAwIDAgMS0xLjg4Ljg5NC4xMjcuMTI3IDAgMCAwLS4wNjguMTc3Yy4zMDMuNTc2LjY0OCAxLjEzIDEuMDI5IDEuNjU3YS4xMjYuMTI2IDAgMCAwIC4xNC4wNDcgMTkuOTYzIDE5Ljk1IDAgMCAwIDYuMDUzLTMuMDUxLjEyOS4xMjkgMCAwIDAgLjA1Mi0uMDkzYy4zMzEtNC43MzMtLjU1NS04LjgzNi0yLjM1Mi0xMi40OGEuMS4xIDAgMCAwLS4wNTMtLjA0N3pNOC4wMiAxNC4zMzRjLS43ODMgMC0xLjQyOS0uNzE5LTEuNDI5LTEuNjAyIDAtLjg4My42My0xLjYwMiAxLjQyOS0xLjYwMi44MDYgMCAxLjQ0NC43MjYgMS40MjkgMS42MDIgMCAuODgzLS42MyAxLjYwMi0xLjQyOSAxLjYwMnptNy45NzUgMGMtLjc4MyAwLTEuNDI5LS43MTktMS40MjktMS42MDIgMC0uODgzLjYzLTEuNjAyIDEuNDI5LTEuNjAyLjgwNiAwIDEuNDQ0LjcyNiAxLjQyOSAxLjYwMiAwIC44ODMtLjYyMyAxLjYwMi0xLjQyOSAxLjYwMnoiIGZpbGw9IiM1ODY1RjIiLz48L3N2Zz4='
    },
    {
      name: 'Spotify',
      icon: 'music',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDI0QzUuMzczIDI0IDAgMTguNjI3IDAgMTJTNS4zNzMgMCAxMiAwczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyem01LjAxLTEzLjY4MWE1NS40NyA1NS40NyAwIDAgMC0xMC4wMi0uNThjLS4xODkgMC0uMzY3LjAwNC0uNTQ1LjAxYS4yNy4yNyAwIDAgMC0uMjU3LjI3Mi4yNjguMjY4IDAgMCAwIC4yNTguMjdoLjAwMWMuMTcyLS4wMDYuMzQzLS4wMDkuNTE0LS4wMDlhNTYuMDY1IDU2LjA2NSAwIDAgMSA5LjkyNy41NzJjLjE1Mi4wMjIuMjkzLS4wNzkuMzE1LS4yMjguMDIyLS4xNS0uMDc5LS4yOS0uMjI4LS4zMTJ6bS40NyAyLjY1YTU4LjI4MyA1OC4yODMgMCAwIDAtMTEuNTMtLjg1NGMtLjE1NCAwLS4yNzkuMTI1LS4yNzkuMjc5YS4yNzguMjc4IDAgMCAwIC4yNzkuMjc5IDU3LjcyMyA1Ny43MjMgMCAwIDEgMTEuNDE0Ljg0NS4yNzkuMjc5IDAgMCAwIC4zMTQtLjIzOS4yNzkuMjc5IDAgMCAwLS4yMzgtLjMxNHptLjY5MyAyLjgxNWMtMy41My0uODE3LTguMzM5LTEuMDk1LTExLjQ4NC0uNzAzYS4yOTQuMjk0IDAgMSAxLS4xMTctLjU3N2MzLjI1OC0uNDA1IDguMjU3LS4xMTcgMTEuOTg1Ljc4YS4yOTUuMjk1IDAgMSAxLS4xNDcuNTc0bC0uMjM3LS4wNzR6IiBmaWxsPSIjMUVENzYwIi8+PC9zdmc+'
    },
    {
      name: 'Gmail',
      icon: 'mail',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMyA1LjI1VjE4Ljc1QzMgMTkuOTkyNiAzLjk5NzQgMjEgNS4yNSAyMUgxOC43NUM0OS45OTI2IDIxIDUxIDIwLjAwMjYgNTEgMTguNzVWNS4yNUM1MSA0LjAwNzM2IDUwLjAwMjYgMTUgNDguNzUgMTVINS4yNUM0LjAwNzM2IDE1IDMgNC4wMDczNiAzIDUuMjV6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTIxIDEyLjA5NiAxNS4wOTcgNi4xOTNIMjEuMDk2VjEyLjA5NnpNMyA2LjE5M0w4LjkwMyAxMi4wOTYgMyAxOC4wOTdWNi4xOTN6IiBmaWxsPSIjRUE0MzM1Ii8+PHBhdGggZD0iTTEzLjUgMTIuNUw4LjkwMyAxOC4wOThIMy45OTdMMi41OTMgMTkuNDk5TDggMTMuOTk2TDEzLjUgMTIuNXoiIGZpbGw9IiNGQkJDMDQiLz48cGF0aCBkPSJNMjAgMTguMDk4SDE1LjA5N0wxMC41IDEyLjVMMTYgOC45MDNMMjEgMTIuMDk3VjE4LjA5OHoiIGZpbGw9IiMzNEE4NTMiLz48cGF0aCBkPSJNMyA2LjE5M0w4LjkwMyAxMi4wOTZMNCAxNlYxMC4wOTZMMy4zNCA5LjM0MkwzIDYuMTkzeiIgZmlsbD0iI0M1MjIxRiIvPjwvZz48L3N2Zz4='
    },
    {
      name: 'Slack',
      icon: 'hash',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTUuMDQyIDE1LjE2NWEyLjUyOCAyLjUyOCAwIDAgMS0yLjUyIDIuNTIzQTIuNTI4IDIuNTI4IDAgMCAxIDAgMTUuMTY1YTIuNTI3IDIuNTI3IDAgMCAxIDIuNTIyLTIuNTIzaDIuNTJ2Mi41MjN6bTEuMjY3IDBhMi41MjggMi41MjggMCAwIDEgMi41MjEtMi41MjMgMi41MjcgMi41MjcgMCAwIDEgMi41MjIgMi41MjN2Ni4zMTVBMi41MjggMi41MjggMCAwIDEgOC44MyAyNGEyLjUyOCAyLjUyOCAwIDAgMS0yLjUyMS0yLjUydi02LjMxNXoiIGZpbGw9IiNFMDFGNUYiLz48cGF0aCBkPSJNOC44MyA1LjA0MmEyLjUyOCAyLjUyOCAwIDAgMS0yLjUyMS0yLjUyQTIuNTI4IDIuNTI4IDAgMCAxIDguODMgMGEyLjUyOCAyLjUyOCAwIDAgMSAyLjUyMiAyLjUyMnYyLjUySDguODN6bTAgMS4yNjdhMi41MjggMi41MjggMCAwIDEgMi41MjIgMi41MjEgMi41MjggMi41MjggMCAwIDEtMi41MjIgMi41MjJIMi41MjJBMi41MjggMi41MjggMCAwIDEgMCA4LjgzYTIuNTI4IDIuNTI4IDAgMCAxIDIuNTIyLTIuNTIxaDYuMzA4eiIgZmlsbD0iIzM2QzVGMCIvPjxwYXRoIGQ9Ik0xOC45NTYgOC44M2EyLjUyOCAyLjUyOCAwIDAgMSAyLjUyMi0yLjUyMUEyLjUyOCAyLjUyOCAwIDAgMSAyNCA4LjgzYTIuNTI4IDIuNTI4IDAgMCAxLTIuNTIyIDIuNTIyaC0yLjUyMlY4Ljgzem0tMS4yNjggMGEyLjUyOCAyLjUyOCAwIDAgMS0yLjUyMSAyLjUyMiAyLjUyOCAyLjUyOCAwIDAgMS0yLjUyMS0yLjUyMlYyLjUyMkEyLjUyOCAyLjUyOCAwIDAgMSAxNS4xNjcgMGEyLjUyOCAyLjUyOCAwIDAgMSAyLjUyMSAyLjUyMnY2LjMwOHoiIGZpbGw9IiMyRUI2N0QiLz48cGF0aCBkPSJNMTUuMTY3IDE4Ljk1NmEyLjUyOCAyLjUyOCAwIDAgMSAyLjUyMSAyLjUyMiAyLjUyOCAyLjUyOCAwIDAgMS0yLjUyMSAyLjUyMiAyLjUyOCAyLjUyOCAwIDAgMS0yLjUyMS0yLjUyMnYtMi41MjJoMi41MjF6bTAgMS4yNjhhMi41MjggMi41MjggMCAwIDEtMi41MjEtMi41MjIgMi41MjggMi41MjggMCAwIDEgMi41MjEtMi41MjFoNi4zMDFBMi41MjggMi41MjggMCAwIDEgMjQgMTcuNzAyYTIuNTI4IDIuNTI4IDAgMCAxLTIuNTMxIDIuNTIyaC02LjMwMnoiIGZpbGw9IiNFQ0IyMkUiLz48L2c+PC9zdmc+'
    },
    {
      name: 'VS Code',
      icon: 'code',
      customIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIzLjE1IDIuNTg3TDE4LjIxLjIxYTEuNDk0IDEuNDk0IDAgMCAwLTEuNzA1LjI5bC05LjQ2IDguNjMtNC4xMi0zLjEyOGEuOTk5Ljk5OSAwIDAgMC0xLjI3Ni4wNTdMLjMyNyA3LjI2MUExIDEgMCAwIDAgLjMyNiA4Ljc0TDMuODk5IDEyIC4zMjYgMTUuMjZhMSAxIDAgMCAwIC4wMDEgMS40NzlMMS42NSAxOC4xYS45OTkuOTk5IDAgMCAwIDEuMjc2LjA1N2w0LjEyLTMuMTI4IDkuNDYgOC42M2ExLjQ5MiAxLjQ5MiAwIDAgMCAxLjcwNC4yOWw0Ljk0Mi0yLjM3N0ExLjUgMS41IDAgMCAwIDI0IDIwLjA2VjMuOTM5YTEuNSAxLjUgMCAwIDAtLjg1LTEuMzUyem0tNS4xNDYgMTQuODYxTDEwLjgyNiAxMmw3LjE3OC01LjQ0OHYxMC44OTZ6IiBmaWxsPSIjMDBBQ0VFIi8+PC9zdmc+'
    }
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'square',
      type: 'component',
      component: '',
      url: '',
      pinnedToTaskbar: false,
      pinnedToDesktop: true,
      desktopPosition: { x: 50, y: 50 },
      defaultSize: { width: 800, height: 600 },
      description: ''
    });
    setEditingApp(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) return;

    if (editingApp) {
      updateApp(editingApp, formData);
    } else {
      const newApp: App = {
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        icon: formData.icon || 'square',
        customIcon: formData.customIcon,
        type: formData.type || 'component',
        component: formData.component,
        url: formData.url,
        pinnedToTaskbar: formData.pinnedToTaskbar || false,
        pinnedToDesktop: formData.pinnedToDesktop !== false,
        desktopPosition: formData.desktopPosition || { x: 50, y: 50 },
        defaultSize: formData.defaultSize || { width: 800, height: 600 },
        description: formData.description || ''
      };
      addApp(newApp);
    }

    resetForm();
  };

  const handleEdit = (app: App) => {
    setFormData(app);
    setEditingApp(app.id);
    setShowAddForm(true);
  };

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolioOS-config.json';
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        importConfig(json);
      };
      reader.readAsText(file);
    }
  };

  const extractAppNameFromURL = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      const name = hostname.split('.')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      return 'New App';
    }
  };

  const handleQuickAdd = () => {
    if (!quickURL.trim()) return;

    let url = quickURL.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const appName = extractAppNameFromURL(url);
    const newApp: App = {
      id: `${appName.toLowerCase()}-${Date.now()}`,
      name: appName,
      icon: 'globe',
      type: 'iframe',
      url: url,
      pinnedToTaskbar: true,
      pinnedToDesktop: true,
      desktopPosition: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
      defaultSize: { width: 1000, height: 700 },
      description: `Iframe app: ${url}`
    };

    addApp(newApp);
    setQuickURL('');
    setShowQuickAdd(false);
  };

  const handleBulkImport = () => {
    if (!bulkURLs.trim()) return;

    const urls = bulkURLs.split('\n').filter(line => line.trim());

    urls.forEach((line, index) => {
      const parts = line.split('|').map(p => p.trim());
      let url = parts[0];
      const name = parts[1] || extractAppNameFromURL(url);
      const icon = parts[2] || 'globe';

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const newApp: App = {
        id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
        name: name,
        icon: icon,
        type: 'iframe',
        url: url,
        pinnedToTaskbar: true,
        pinnedToDesktop: true,
        desktopPosition: { x: 50 + (index * 30), y: 50 + (index * 30) },
        defaultSize: { width: 1000, height: 700 },
        description: `Iframe app: ${url}`
      };

      addApp(newApp);
    });

    setBulkURLs('');
    setShowBulkImport(false);
  };

  const handleURLPreview = (url: string) => {
    if (url.trim()) {
      let fullURL = url.trim();
      if (!fullURL.startsWith('http://') && !fullURL.startsWith('https://')) {
        fullURL = 'https://' + fullURL;
      }
      setPreviewURL(fullURL);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newBackground = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          url: dataUrl,
          thumbnail: dataUrl
        };
        addBackground(newBackground);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  if (!isAdminMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-[10000]"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-6xl max-h-[90vh] flex flex-col"
        >
          {/* Top gradient accent line - Netflix style */}
          <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t" />

          <div className="flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="shrink-0 px-6 py-4 border-b bg-gradient-to-r from-transparent via-gray-700/30 to-transparent" style={{borderImage: 'linear-gradient(to right, transparent, rgb(55 65 81 / 0.5), transparent) 1'}}>
              <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Icons.Shield className="w-6 h-6" />
                  Admin Dashboard
                </h2>
                <p className="text-blue-100 text-sm mt-1">Manage apps and configuration</p>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'apps' && (
                  <>
                    <Button
                      onClick={handleExport}
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 border-none"
                    >
                      <Icons.Download className="w-4 h-4" />
                      Export
                    </Button>
                    <label className="cursor-pointer">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 border-none"
                        asChild
                      >
                        <span>
                          <Icons.Upload className="w-4 h-4" />
                          Import
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setActiveTab('apps')}
                variant="secondary"
                size="md"
                className={
                  activeTab === 'apps'
                    ? 'bg-white text-primary-600 hover:bg-white/90 border-none'
                    : 'bg-white/20 text-white hover:bg-white/30 border-none'
                }
              >
                <Icons.Grid3x3 className="w-4 h-4 inline mr-2" />
                Apps
              </Button>
              <Button
                onClick={() => setActiveTab('backgrounds')}
                variant="secondary"
                size="md"
                className={
                  activeTab === 'backgrounds'
                    ? 'bg-white text-primary-600 hover:bg-white/90 border-none'
                    : 'bg-white/20 text-white hover:bg-white/30 border-none'
                }
              >
                <Icons.Image className="w-4 h-4 inline mr-2" />
                Backgrounds
              </Button>
            </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'apps' && (
              <>
                <div className="mb-6 grid grid-cols-3 gap-3">
              <Button
                onClick={() => {
                  setShowQuickAdd(!showQuickAdd);
                  setShowAddForm(false);
                  setShowBulkImport(false);
                }}
                variant="success"
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Icons.Zap className="w-5 h-5" />
                Quick Add URL
              </Button>
              <Button
                onClick={() => {
                  setShowBulkImport(!showBulkImport);
                  setShowAddForm(false);
                  setShowQuickAdd(false);
                }}
                variant="tertiary"
                size="lg"
              >
                <Icons.Package className="w-5 h-5" />
                Bulk Import
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setShowQuickAdd(false);
                  setShowBulkImport(false);
                }}
                variant="primary"
                size="lg"
              >
                <Icons.Plus className="w-5 h-5" />
                Advanced Add
              </Button>
            </div>

            {showQuickAdd && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-md rounded p-6 mb-6 border-b border-green-500/30"
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icons.Zap className="w-5 h-5" />
                  Quick Add from URL
                </h3>
                <p className="text-green-100 text-sm mb-4">
                  Paste any website URL to instantly add it as an iframe app. We'll auto-detect the name and set optimal defaults.
                </p>
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={quickURL}
                    onChange={(e) => setQuickURL(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                    variant="solid"
                    size="lg"
                    className="border-green-600 focus:border-green-400"
                    placeholder="https://example.com or example.com"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickAdd}
                      variant="success"
                      size="md"
                      className="flex-1"
                    >
                      Add App
                    </Button>
                    {quickURL && (
                      <Button
                        onClick={() => handleURLPreview(quickURL)}
                        variant="secondary"
                        size="md"
                      >
                        <Icons.Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {showBulkImport && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-gradient-to-br from-tertiary-900/30 to-primary-900/30 backdrop-blur-md rounded p-6 mb-6 border-b border-tertiary-500/30"
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icons.Package className="w-5 h-5" />
                  Bulk Import Apps
                </h3>
                <p className="text-tertiary-100 text-sm mb-4">
                  Add multiple apps at once. Enter one URL per line. Optional format: <code className="bg-black/30 px-1 rounded">URL | Name | Icon</code>
                </p>
                <div className="space-y-3">
                  <textarea
                    value={bulkURLs}
                    onChange={(e) => setBulkURLs(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-tertiary-600 focus:outline-none focus:border-tertiary-400 placeholder-gray-400 font-mono text-sm"
                    placeholder={"https://example1.com\nhttps://example2.com | Custom Name | gamepad-2\nhttps://example3.com | Another App"}
                    rows={6}
                    autoFocus
                  />
                  <Button
                    onClick={handleBulkImport}
                    variant="tertiary"
                    size="md"
                  >
                    Import All Apps
                  </Button>
                </div>
              </motion.div>
            )}

            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-900/70 backdrop-blur-md rounded p-6 mb-6 border-b border-white/10"
              >
                <h3 className="text-white text-lg font-semibold mb-4">
                  {editingApp ? 'Edit App' : 'New App'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">App Name</label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        variant="solid"
                        placeholder="My App"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Icon</label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary-500"
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Custom Icon Upload */}
                  <div>
                    <label className="text-white text-sm mb-2 block">Custom Icon (Optional)</label>
                    <div className="flex items-center gap-3">
                      {formData.customIcon ? (
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-600">
                            <img
                              src={formData.customIcon}
                              alt="Custom icon preview"
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <span className="text-gray-300 text-sm flex-1">Custom icon uploaded</span>
                          <Button
                            type="button"
                            onClick={() => setFormData({ ...formData, customIcon: undefined })}
                            variant="danger"
                            size="sm"
                          >
                            <Icons.X className="w-4 h-4" />
                            Clear
                          </Button>
                        </div>
                      ) : (
                        <label className="flex-1 cursor-pointer">
                          <div className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-600 flex items-center justify-center gap-2 transition-colors">
                            <Icons.Upload className="w-4 h-4" />
                            Upload Custom Icon
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  alert('Image too large (max 2MB)');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const dataUrl = event.target?.result as string;
                                  setFormData({ ...formData, customIcon: dataUrl });
                                };
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Upload PNG, JPG, or SVG (max 2MB). Custom icon will override the selected icon above.</p>
                  </div>

                  {/* Icon Library */}
                  <div>
                    <label className="text-white text-sm mb-2 block">Icon Library</label>
                    <div className="grid grid-cols-4 gap-2">
                      {iconLibrary.map((libIcon) => {
                        const isSelected = formData.customIcon === libIcon.customIcon;
                        return (
                          <button
                            key={libIcon.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, customIcon: libIcon.customIcon })}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                              isSelected
                                ? 'border-primary-500 bg-primary-500/20'
                                : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                            }`}
                          >
                            <img
                              src={libIcon.customIcon}
                              alt={libIcon.name}
                              className="w-8 h-8 object-contain"
                            />
                            <span className="text-xs text-white text-center">{libIcon.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-gray-400 text-xs mt-2">Click any icon to use it for your app</p>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary-500"
                    >
                      <option value="component">React Component</option>
                      <option value="iframe">IFrame URL</option>
                      <option value="static">Static Content</option>
                    </select>
                  </div>

                  {formData.type === 'component' && (
                    <div>
                      <label className="text-white text-sm mb-2 block">Component Name</label>
                      <Input
                        type="text"
                        value={formData.component}
                        onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                        variant="solid"
                        placeholder="MyComponent"
                      />
                    </div>
                  )}

                  {formData.type === 'iframe' && (
                    <div>
                      <label className="text-white text-sm mb-2 block">URL</label>
                      <Input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        variant="solid"
                        placeholder="https://example.com"
                        required
                      />
                      <p className="text-gray-400 text-xs mt-1">Add any external website or web app URL</p>
                    </div>
                  )}

                  <div>
                    <label className="text-white text-sm mb-2 block">Description</label>
                    <Input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      variant="solid"
                      placeholder="Brief description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pinnedToTaskbar}
                        onChange={(e) => setFormData({ ...formData, pinnedToTaskbar: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Pin to Taskbar
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pinnedToDesktop}
                        onChange={(e) => setFormData({ ...formData, pinnedToDesktop: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Pin to Desktop
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">Width (px)</label>
                      <Input
                        type="number"
                        value={formData.defaultSize?.width}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultSize: { ...formData.defaultSize, width: parseInt(e.target.value) || 800 }
                        })}
                        variant="solid"
                        min={300}
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Height (px)</label>
                      <Input
                        type="number"
                        value={formData.defaultSize?.height}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultSize: { ...formData.defaultSize, height: parseInt(e.target.value) || 600 }
                        })}
                        variant="solid"
                        min={200}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      {editingApp ? 'Update App' : 'Create App'}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetForm}
                      variant="secondary"
                      size="md"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="bg-gray-900/70 backdrop-blur-md rounded border-b border-white/10 overflow-hidden shadow-xl">
              <div className="bg-white/5 backdrop-blur-sm px-4 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-300 uppercase border-b border-white/10">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Taskbar</div>
                <div className="col-span-2">Desktop</div>
                <div className="col-span-3">Actions</div>
              </div>

              <div className="divide-y divide-white/10">
                {apps.map((app) => {
                  const Icon = getIcon(app.icon);
                  return (
                    <div key={app.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-colors">
                      <div className="col-span-3 flex items-center gap-2">
                        {app.customIcon ? (
                          <img
                            src={app.customIcon}
                            alt={app.name}
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <Icon className="w-5 h-5 text-primary-400" />
                        )}
                        <span className="text-white text-sm font-medium truncate">{app.name}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                          {app.type}
                        </span>
                      </div>
                      <div className="col-span-2">
                        {app.pinnedToTaskbar ? (
                          <Icons.Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Icons.X className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="col-span-2">
                        {app.pinnedToDesktop ? (
                          <Icons.Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Icons.X className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="col-span-3 flex gap-2">
                        <Button
                          onClick={() => handleEdit(app)}
                          variant="primary"
                          size="icon"
                          className="w-8 h-8"
                        >
                          <Icons.Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeApp(app.id)}
                          variant="danger"
                          size="icon"
                          className="w-8 h-8"
                        >
                          <Icons.Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
              </>
            )}

            {activeTab === 'backgrounds' && (
              <>
                <div className="mb-6">
                  <label className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold cursor-pointer">
                    <Icons.Upload className="w-5 h-5" />
                    Upload Background Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBackgroundUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-400 text-sm text-center mt-2">
                    Upload JPG, PNG, or WebP images (multiple files supported)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {backgrounds.map((bg) => {
                    const isSelected = selectedBackgroundId === bg.id;
                    const isDefault = bg.id.startsWith('default-');
                    const isGradient = bg.url.startsWith('linear-gradient');

                    return (
                      <div
                        key={bg.id}
                        className={`relative rounded-xl overflow-hidden border-4 transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-primary-500 shadow-lg shadow-primary-500/50'
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedBackground(bg.id)}
                      >
                        <div
                          className="w-full h-40 bg-cover bg-center"
                          style={{
                            background: isGradient ? bg.url : 'transparent',
                            backgroundImage: !isGradient ? `url(${bg.url})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />

                        <div className="bg-gray-900/80 backdrop-blur-sm p-3 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold text-sm truncate">
                                {bg.name}
                              </h3>
                              {isDefault && (
                                <span className="text-xs text-gray-400">Built-in</span>
                              )}
                            </div>
                            {isSelected && (
                              <Icons.Check className="w-5 h-5 text-primary-400 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </div>

                        {!isDefault && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBackground(bg.id);
                            }}
                            variant="danger"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                          >
                            <Icons.Trash2 className="w-4 h-4 text-white" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {backgrounds.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Icons.Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No backgrounds available. Upload some images to get started!</p>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        </motion.div>

        {previewURL && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[15001] flex items-center justify-center p-4"
            onClick={() => setPreviewURL(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl max-h-[90vh]"
            >
              <Surface
                variant="panel"
                elevation="highest"
                blur="lg"
                border="default"
                className="flex flex-col h-full overflow-hidden"
              >
                <SurfaceHeader className="bg-gradient-to-r from-primary-600 to-tertiary-600 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Preview</h3>
                      <p className="text-xs text-white/80">{previewURL}</p>
                    </div>
                    <Button
                      onClick={() => setPreviewURL(null)}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Icons.X className="w-5 h-5" />
                    </Button>
                  </div>
                </SurfaceHeader>
                <div className="flex-1 bg-white overflow-hidden">
                  <iframe
                    src={previewURL}
                    className="w-full h-full"
                    title="App Preview"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              </Surface>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
