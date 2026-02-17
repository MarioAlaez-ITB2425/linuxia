
import React, { useState, useEffect } from 'react';

const BOOT_MESSAGES = [
  "[    0.000000] Linux version 6.5.0-MarioOS (gcc version 13.2.1)",
  "[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-linux root=UUID=mario-os-root rw quiet",
  "[    0.000000] x86/fpu: Supporting XSAVE feature set 0x01f: 'x87 floating point registers'",
  "[    0.004231] Console: colour dummy device 80x25",
  "[    0.015243] Memory: 16384K/32768K available (14336K kernel code, 2048K reserved)",
  "[    0.142512] Checking for hypervisor virtualization...",
  "[    0.256123] Detected MarioOS v1.0.4 Hypervisor",
  "[    0.512345] ACPI: Core revision 20230331",
  "[    0.892314] pci 0000:00:00.0: [8086:1237] type 00 class 0x060000",
  "[    1.241512] usbcore: registered new interface driver usbfs",
  "[    1.351234] usbcore: registered new interface driver hub",
  "[    1.562312] i8042: PNP: PS/2 Controller [PNP0303:KBD, PNP0f13:MOU] at 0x60,0x64 irq 1,12",
  "[    1.823451] input: AT Translated Set 2 keyboard as /devices/platform/i8042/serio0/input/input0",
  "[    2.123145] EXT4-fs (vda2): mounted filesystem with ordered data mode. Opts: (null)",
  "[    2.451231] systemd[1]: systemd 254.1-1-arch running in system mode (+PAM +AUDIT +SELINUX)",
  "[    2.781234] systemd[1]: Detected architecture x86-64.",
  "[    3.123451] systemd[1]: Set up automount Arbitrary Executable File Formats File System.",
  "[    3.456123] systemd[1]: Reached target Local File Systems (Pre).",
  "[    3.671234] systemd[1]: Started Dispatch Password Requests to Console Directory Watch.",
  "[    3.891234] systemd[1]: Reached target Local File Systems.",
  "[    4.123451] systemd[1]: Starting Network Time Synchronization...",
  "[    4.341231] systemd[1]: Started Network Time Synchronization.",
  "[    4.561234] systemd[1]: Reached target System Initialization.",
  "[    4.781234] systemd[1]: Starting Graphical Interface...",
  "[    5.012345] MarioOS: Boot Sequence Complete. Launching GDM...",
];

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < BOOT_MESSAGES.length) {
        setVisibleMessages(prev => [...prev, BOOT_MESSAGES[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full h-full bg-black p-8 font-mono text-emerald-500 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-1">
        {visibleMessages.map((msg, i) => (
          <div key={i} className="text-sm">{msg}</div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
};

export default BootScreen;
