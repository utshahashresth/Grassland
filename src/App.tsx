import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Dashboard } from './retreat/Dashboard'
import { ManagerShell } from './retreat/Shell'
import { NewBooking, type NewBookingResult } from './retreat/NewBooking'
import LoginPage from './retreat/Login/Page'
import { ARRIVALS, VILLA_STATES, RULES, type BookingRow, type VillaState } from './retreat/data'

/* Manager shell. Dashboard and new-booking form are now separate routes
 * (/ and /booking) instead of a `screen` state toggle. Booking list,
 * villa states and the confirmation banner stay lifted here so a
 * confirmed booking shows up on the dashboard after navigating back. */

function App() {
  const navigate = useNavigate()
  const [arrivals, setArrivals] = useState<BookingRow[]>(ARRIVALS)
  const [villaStates, setVillaStates] =
    useState<Record<string, [VillaState, string]>>(VILLA_STATES)
  const [confirmation, setConfirmation] = useState('')
  const [seq, setSeq] = useState(4477)

  const generate = (code: string) => {
    setArrivals((prev) => prev.map((r) => (r.code === code ? { ...r, passes: true } : r)))
    setConfirmation(
      RULES.autoSendPasses
        ? `Passes generated for ${code} — sent to the booker by email and SMS.`
        : `Passes generated for ${code} — held for you to send from the booking.`,
    )
  }

  const confirmBooking = ({ row, confirmation: text, villaName, villaDetail }: NewBookingResult) => {
    setArrivals((prev) => [row, ...prev])
    setVillaStates((prev) => ({ ...prev, [villaName]: ['arriving', villaDetail] }))
    setConfirmation(text)
    setSeq((s) => s + 1)
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Dashboard
            arrivals={arrivals}
            villaStates={villaStates}
            confirmation={confirmation}
            onGenerate={generate}
            onDismissConfirmation={() => setConfirmation('')}
            onAddBooking={() => navigate('/booking')}
            onViewBooking={() => navigate('/booking')}
          />
        }
      />
      <Route
        path="/booking"
        element={
          <ManagerShell title="New booking" active="booking">
            <NewBooking seq={seq} onCancel={() => navigate('/')} onConfirm={confirmBooking} />
          </ManagerShell>
        }
      />
    </Routes>
  )
}

export default App