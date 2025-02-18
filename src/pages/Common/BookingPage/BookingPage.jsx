import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Place from "../../../components/BookingPageComponents/Place/Place"
import TicketInfo from "../../../components/BookingPageComponents/TicketInfo/TicketInfo"
import Button from "../../../components/SharedComponents/Button/Button"

import timeUtils from "../../../helpers/timeUtils"
import userUtils from "../../../helpers/userUtils"

import styles from "./styles/BookingPage.module.css"

function BookingPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const selectedMovie = sessionStorage.getItem("movieTitle")
    const [sessionInfo, setSessionInfo] = useState({})
    const [placement, setPlacement] = useState({ hallName: 0, rowCount: 0, placeCount: 0 })
    const [selectedTickets, setSelectedTickets] = useState([])
    const [bookedTickets, setBookedTickets] = useState([])
    const [ticketsPrice, setTicketsPrice] = useState(0)

    useEffect(() => {
        fetch(`https://localhost:7118/api/Session/GetSessionById?id=${id}`)
            .then(response => response.json())
            .then(data => setSessionInfo(data))
            .catch(err => console.log(err))

    }, [])

    useEffect(() => {
        fetch(`https://localhost:7118/api/Hall/GetHallById?id=${sessionInfo.hallId || 0}`)
            .then(response => response.json())
            .then(data => setPlacement({ hallName: data.name, rowCount: data.rowCount, placeCount: data.placeCount }))
            .catch(err => console.log(err))
    }, [sessionInfo])

    useEffect(() => {
        fetch(`https://localhost:7118/api/Ticket/GetTicketWithStrategy?SessionId=${id}`)
            .then(response => response.json())
            .then(data => setBookedTickets(data))
            .catch(err => console.log(err))
    }, [selectedTickets])

    useEffect(() => {
        const totalPrice = selectedTickets.reduce((acc, ticket) => acc + ticket.price, 0);
        setTicketsPrice(totalPrice)
    }, [selectedTickets])

    function onClick(row, place) {
        const result = selectedTickets.find(ticket => ticket.row === row && ticket.place === place)
        if (!result) {
            const newTicket = {
                sessinId: id,
                userId: userUtils.GetUserId(),
                row: row,
                place: place,
                statusId: 1,
                title: selectedMovie,
                hallName: placement.hallName,
                price: 150
            }
            setSelectedTickets(
                [...selectedTickets, newTicket]
            )
        } else {
            deleteItem(row, place)
        }
    }
    function deleteItem(row, place) {
        const updatedTickets = selectedTickets.filter(ticket => !(ticket.row === row && ticket.place === place))
        setSelectedTickets(updatedTickets)
    }

    function isBooked(row, place) {
        return bookedTickets.some(ticket => ticket.row === row && ticket.place === place)
    }

    function bookTickets() {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate('/signin')
        }
        selectedTickets.forEach(ticket => {
            fetch(`https://localhost:7118/api/Ticket/CreateTicket`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    SessionId: Number(id),
                    UserId: Number(ticket.userId),
                    Row: ticket.row,
                    Place: ticket.place,
                    StatusId: ticket.statusId,
                    Price: ticket.price
                })
            })
                .then(response => {
                    console.log(response)
                    if (response.ok) {
                        setSelectedTickets([])
                    }
                })
                .catch(err => console.log(err))
        })
    }


    return (
        <div className={`${styles.booking_wrapper}`}>
            <div className={`${styles.title}`}>
                <h1>{selectedMovie ? selectedMovie : "Unknown"}</h1>
                <span>{timeUtils.stripDateTime(sessionInfo.date)} {timeUtils.convertToHourMinute(sessionInfo.date)}</span>
                <span>Hall {placement.hallName}</span>
            </div>
            <div className={`${styles.booking_container}`}>
                <div className={`${styles.placement_container}`} style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${placement.rowCount}, 1fr)`,
                    gridTemplateColumns: `repeat(${placement.placeCount}, 1fr)`,
                    gap: "10px",
                    width: "800px",
                    alignItems: "start",
                }}>
                    {Array.from({ length: placement.rowCount }, (_, i) => (
                        <>
                            {Array.from({ length: placement.placeCount }, (_, j) => (
                                <Place key={i + j} row={i} place={j} isBooked={isBooked(i + 1, j + 1)}
                                    isSelected={selectedTickets.find(ticket => ticket.row === i + 1 && ticket.place === j + 1)} onClick={onClick} />
                            ))}
                        </>
                    ))}
                </div>
                <div className={`${styles.tickets_booking_container}`}>
                    <div className={`${styles.tickets_container_title}`}> Tickets </div>
                    <div className={`${styles.tickets_container}`}>
                        {
                            selectedTickets.map(ticket => (
                                <TicketInfo
                                    deleteItem={deleteItem}
                                    dateTime={timeUtils.stripDateTime(sessionInfo.date) + " " + timeUtils.convertToHourMinute(sessionInfo.date)}
                                    row={ticket.row}
                                    place={ticket.place}
                                    title={ticket.title}
                                    hallName={ticket.hallName} />
                            ))
                        }
                    </div>
                    <div className={`${styles.interaction_section}`}>
                        <span> Total Price: {ticketsPrice} </span>
                        <Button onClick={bookTickets}> Book tickets </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingPage
