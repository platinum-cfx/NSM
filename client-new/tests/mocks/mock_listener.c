/* mock server / masterlist: listens on PORT, accepts forever */
#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdio.h>
int main(void) {
    WSADATA w; SOCKET s, c; struct sockaddr_in a; int on = 1;
    WSAStartup(MAKEWORD(2,2), &w);
    s = socket(AF_INET, SOCK_STREAM, 0);
    setsockopt(s, SOL_SOCKET, SO_REUSEADDR, (char*)&on, sizeof on);
    a.sin_family = AF_INET; a.sin_port = htons(PORT); a.sin_addr.s_addr = htonl(INADDR_ANY);
    if (bind(s, (struct sockaddr*)&a, sizeof a) != 0) { printf("mock bind failed %d\n", WSAGetLastError()); return 1; }
    listen(s, 16);
    printf("mock listening on %d\n", PORT); fflush(stdout);
    for (;;) { c = accept(s, NULL, NULL); if (c != INVALID_SOCKET) { const char *r = "HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\n{}"; send(c, r, strlen(r), 0); closesocket(c); } }
}
