import convertToLocaleDate from "@/lib/utils/convertToLocaleDate";
import gzRequest from "@/lib/utils/gzRequest";

export default async function fetchBookings(
    query: BookingQuery,
    authToken?: string
): Promise<GZResponse<GZPage<Partial<Booking>>>> {
    return gzRequest<BookingQuery, null, GZPage<Partial<Booking>>>({
        requestMethod: "GET",
        requestQuery: { ...query, forDate: convertToLocaleDate(query.forDate) },
        requestPath: "/booking/search",
        authToken: authToken,
    });
}