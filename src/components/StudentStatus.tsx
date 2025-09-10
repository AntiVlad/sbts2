export default function StudentStatus({ fullName, regNo, date }: { fullName: string; regNo: string; date: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-lg font-semibold">{fullName}</div>
      <div className="text-white/70">Reg No: {regNo}</div>
      <div className="text-white/60 text-sm">Today: {date}</div>
    </div>
  )
}
