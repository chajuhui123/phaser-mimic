import { useCallback, useEffect, useRef, useState } from 'react';
import { TICKET_MAX, TICKET_REFILL_INTERVAL_MS } from '../constants';

export function useTicketState() {
    const [tickets, setTickets] = useState(TICKET_MAX);
    const ticketsRef = useRef(TICKET_MAX);

    useEffect(() => {
        const id = setInterval(() => {
            ticketsRef.current = Math.min(TICKET_MAX, ticketsRef.current + 1);
            setTickets(ticketsRef.current);
        }, TICKET_REFILL_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    // 동기적으로 성공 여부를 알아야 하므로(버튼 클릭 즉시 판단), ref를 기준으로 판정한다.
    const spend = useCallback((amount: number) => {
        if (ticketsRef.current < amount) return false;
        ticketsRef.current -= amount;
        setTickets(ticketsRef.current);
        return true;
    }, []);

    return { tickets, spend };
}
