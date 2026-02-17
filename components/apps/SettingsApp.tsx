
import React, { useState, useEffect } from 'react';
import { 
  Palette, Monitor, Shield, Wifi, Info, HardDrive, 
  UserCircle, Save, Check, Globe, Lock, Cpu, Server, 
  Database, Activity, ToggleLeft, ToggleRight
} from 'lucide-react';
import { User } from '../../types';

interface SettingsAppProps {
  user: User;
  onUpdateUser: (user: User) => void;
  currentWallpaper: string;
  setWallpaper: (url: string) => void;
  wallpapers: string[];
}

type SettingsTab = 'appearance' | 'user' | 'network' | 'privacy' | 'storage' | 'about';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200&h=200',
  'https://picsum.photos/seed/peach/200',
  'https://picsum.photos/seed/toad/200',
  'https://picsum.photos/seed/yoshi/200',
  'https://picsum.photos/seed/bowser/200'
];

const SettingsApp: React.FC<SettingsAppProps> = ({ user, onUpdateUser, currentWallpaper, setWallpaper, wallpapers }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [tempUsername, setTempUsername] = useState(user.username);
  const [tempAvatar, setTempAvatar] = useState(user.avatar);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Network States
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [ipAddress, setIpAddress] = useState('192.168.1.42');
  const [gateway, setGateway] = useState('192.168.1.1');
  const [dns, setDns] = useState('8.8.8.8');

  // Privacy States
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [telemetry, setTelemetry] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);

  const handleSaveProfile = () => {
    onUpdateUser({ username: tempUsername, avatar: tempAvatar });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const Switch = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className="transition-all active:scale-90">
      {active ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-zinc-600" />}
    </button>
  );

  return (
    <div className="flex h-full bg-zinc-900 text-zinc-300 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-white/5 p-4 flex flex-col gap-1">
        <div className="px-4 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Control Center</div>
        <button 
          onClick={() => setActiveTab('appearance')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'appearance' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 text-zinc-500'}`}
        >
          <Palette className="w-4 h-4" /> Appearance
        </button>
        <button 
          onClick={() => setActiveTab('user')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'user' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 text-zinc-500'}`}
        >
          <UserCircle className="w-4 h-4" /> User Identity
        </button>
        <button 
          onClick={() => setActiveTab('network')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'network' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 text-zinc-500'}`}
        >
          <Wifi className="w-4 h-4" /> Network & IP
        </button>
        <button 
          onClick={() => setActiveTab('privacy')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'privacy' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 text-zinc-500'}`}
        >
          <Lock className="w-4 h-4" /> Privacy & Sec
        </button>
        <button 
          onClick={() => setActiveTab('storage')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'storage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 text-zinc-500'}`}
        >
          <Database className="w-4 h-4" /> Storage Stats
        </button>
        <div className="h-px bg-white/5 my-4"></div>
        <button 
          onClick={() => setActiveTab('about')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'about' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 text-zinc-500'}`}
        >
          <Info className="w-4 h-4" /> About System
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent)]">
        
        {activeTab === 'appearance' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic">APPEARANCE</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-10">Customize your workspace visual matrix</p>
            
            <section className="bg-zinc-800/30 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Desktop Backgrounds</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {wallpapers.map((wp, i) => (
                  <button 
                    key={i}
                    onClick={() => setWallpaper(wp)}
                    className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all group ${currentWallpaper === wp ? 'border-blue-500 ring-4 ring-blue-500/20 scale-95' : 'border-transparent hover:border-white/20'}`}
                  >
                    <img src={wp} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`Wallpaper ${i}`} />
                    {currentWallpaper === wp && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <Check className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic">NETWORK & INTERNET</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-10">Protocol and connectivity management</p>
            
            <div className="grid gap-6 max-w-2xl">
              <div className="bg-zinc-800/30 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${wifiEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Wireless Connection</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{wifiEnabled ? 'Connected: Mario_Net_5G' : 'Disconnected'}</div>
                  </div>
                </div>
                <Switch active={wifiEnabled} onClick={() => setWifiEnabled(!wifiEnabled)} />
              </div>

              <section className="bg-zinc-800/30 p-8 rounded-3xl border border-white/5 space-y-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <Globe className="w-3 h-3" /> IPv4 Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold ml-1 uppercase">IP Address</label>
                    <input type="text" value={ipAddress} onChange={e => setIpAddress(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-emerald-500 outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold ml-1 uppercase">Subnet Mask</label>
                    <input type="text" defaultValue="255.255.255.0" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-zinc-400 outline-none cursor-not-allowed" disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold ml-1 uppercase">Default Gateway</label>
                    <input type="text" value={gateway} onChange={e => setGateway(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-blue-400 outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold ml-1 uppercase">Primary DNS</label>
                    <input type="text" value={dns} onChange={e => setDns(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-amber-500 outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                </div>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all border border-white/5">Renew DHCP Lease</button>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-2xl">
            <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic">PRIVACY & SECURITY</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-10">Deep security and anonymity layers</p>
            
            <div className="space-y-4">
              <div className="bg-zinc-800/30 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl"><Activity className="w-6 h-6" /></div>
                  <div>
                    <div className="font-bold text-white">Neural Link Telemetry</div>
                    <div className="text-xs text-zinc-500">Send system health data to the Kernel Team</div>
                  </div>
                </div>
                <Switch active={telemetry} onClick={() => setTelemetry(!telemetry)} />
              </div>

              <div className="bg-zinc-800/30 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl"><Globe className="w-6 h-6" /></div>
                  <div>
                    <div className="font-bold text-white">Location Services</div>
                    <div className="text-xs text-zinc-500">Allow apps to geolocate this node</div>
                  </div>
                </div>
                <Switch active={locationEnabled} onClick={() => setLocationEnabled(!locationEnabled)} />
              </div>

              <div className="bg-rose-600/10 p-6 rounded-3xl border border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-600 text-white rounded-2xl"><Shield className="w-6 h-6" /></div>
                  <div>
                    <div className="font-bold text-white uppercase tracking-tighter">Firewall Stealth Mode</div>
                    <div className="text-xs text-rose-500 font-bold uppercase tracking-widest">Incoming packets are dropped by default</div>
                  </div>
                </div>
                <Switch active={stealthMode} onClick={() => setStealthMode(!stealthMode)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-2xl">
            <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic">STORAGE</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-10">Hardware allocation and disk health</p>
            
            <div className="bg-zinc-800/30 p-8 rounded-3xl border border-white/5 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                  <HardDrive className="w-10 h-10 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-black text-white italic tracking-tighter">SSD_SYSTEM_DISK (/dev/sda1)</span>
                    <span className="text-xs font-mono text-zinc-500">120 GB / 512 GB Used</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[24%]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1 tracking-widest italic">Disk Health</div>
                  <div className="text-emerald-500 font-black tracking-tighter">EXCELLENT (100%)</div>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1 tracking-widest italic">Encrypted</div>
                  <div className="text-blue-500 font-black tracking-tighter">AES-256-XTS Active</div>
                </div>
              </div>
              
              <button className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all border border-rose-500/20">Format Virtual Drive</button>
            </div>
          </div>
        )}

        {activeTab === 'user' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-2xl">
            <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic">USER IDENTITY</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-10">Node ownership and biometric simulation</p>
            
            <div className="space-y-8">
              <section className="bg-zinc-800/30 p-8 rounded-3xl border border-white/5 flex items-center gap-8">
                <div className="relative group">
                  <img src={tempAvatar} className="w-32 h-32 rounded-3xl border-4 border-white/10 shadow-2xl transition-transform group-hover:scale-105" alt="Preview" />
                  <div className="absolute inset-0 bg-blue-600/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Select Avatar Module</p>
                  <div className="flex flex-wrap gap-3">
                    {AVATAR_PRESETS.map((url, i) => (
                      <button 
                        key={i} 
                        onClick={() => setTempAvatar(url)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${tempAvatar === url ? 'border-blue-500 scale-110 shadow-lg ring-2 ring-blue-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={url} className="w-full h-full object-cover" alt="Preset" />
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-zinc-800/30 p-8 rounded-3xl border border-white/5 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold ml-1 uppercase tracking-widest">Display Handle</label>
                  <input 
                    type="text" 
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold tracking-tight text-white"
                  />
                </div>
              </section>

              <div className="flex items-center justify-between">
                <button 
                  onClick={handleSaveProfile}
                  className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black italic tracking-tighter transition-all shadow-xl active:scale-95 ${saveSuccess ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                >
                  {saveSuccess ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                  {saveSuccess ? 'PROTOCOL UPDATED' : 'APPLY CHANGES'}
                </button>
                {saveSuccess && <span className="text-xs text-emerald-500 font-bold animate-pulse tracking-widest uppercase italic">Encryption updated!</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-2xl">
            <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic">SYSTEM INFO</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-10">Node core and kernel specifications</p>
            
            <div className="bg-zinc-800/30 rounded-3xl border border-white/5 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-zinc-950 rounded-3xl border border-white/5 shadow-inner"><Cpu className="w-8 h-8 text-rose-500" /></div>
                  <div>
                    <div className="font-black italic text-white text-xl tracking-tighter">MarioOS Kernel 6.5.0-mario</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Stable Distribution LTS</div>
                  </div>
                </div>
                <div className="text-[10px] px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-500 font-black uppercase tracking-widest">Secure_Active</div>
              </div>
              
              <div className="h-px bg-white/5"></div>
              
              <div className="grid grid-cols-2 gap-8 text-sm font-mono">
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="text-zinc-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Instance Node</div>
                  <div className="font-black text-blue-400">@{user.username.toUpperCase()}</div>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="text-zinc-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Architecture</div>
                  <div className="font-black text-white">X86_64_HYPERVISOR</div>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="text-zinc-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Shell Version</div>
                  <div className="font-black text-white">BASH 5.2.15-RELEASE</div>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="text-zinc-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Uptime</div>
                  <div className="font-black text-emerald-400">18:42:09 SINCE BOOT</div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center gap-4">
                 <Server className="w-6 h-6 text-blue-500" />
                 <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] leading-relaxed">System is running on localized virtual environment. Security patches are managed via automatic neural updates.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsApp;
