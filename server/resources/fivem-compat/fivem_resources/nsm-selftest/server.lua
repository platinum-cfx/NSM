-- nsm-selftest server: relay + verdict printer.
-- The client resource runs the checks; this side prints the report to the
-- SERVER console (so the whole table lands in one place) and keeps the last
-- report for `exports['nsm-selftest']:GetLatestReport()`.

local latestReport = nil

RegisterNetEvent('nsm-selftest:ping', function()
    local src = source
    TriggerClientEvent('nsm-selftest:pong', src, 'pong-from-server')
end)

-- client wrote a replicated statebag; verify it against the authoritative
-- server-side store (Player(src).state) and ack with the verdict
RegisterNetEvent('nsm-selftest:stateWritten', function(key, expected)
    local src = source
    local stored = Player(src).state[key]
    local ok = stored == expected
    TriggerClientEvent('nsm-selftest:stateAck', src, ok, tostring(stored))
end)

RegisterNetEvent('nsm-selftest:report', function(reportJson)
    local src = source
    local ok, report = pcall(json.decode, reportJson)
    if not ok or type(report) ~= 'table' then
        print(('[nsm-selftest] malformed report from player %s: %s'):format(tostring(src), tostring(reportJson)))
        return
    end
    report.source = src
    latestReport = report

    local pass, fail, skip = 0, 0, 0
    print(('^b[nsm-selftest] report from player %s (%s)^r'):format(tostring(src), tostring(report.env or 'unknown env')))
    for _, c in ipairs(report.checks or {}) do
        if c.skipped then
            skip = skip + 1
            print(('[nsm-selftest]   --  %-42s SKIP (%s)'):format(c.name, c.detail or 'no detail'))
        elseif c.ok then
            pass = pass + 1
            print(('[nsm-selftest]   OK  %-42s %s'):format(c.name, c.detail or ''))
        else
            fail = fail + 1
            print(('^1[nsm-selftest]   FAIL %-42s %s^r'):format(c.name, c.detail or 'no detail'))
        end
    end
    if fail == 0 and skip == 0 then
        print(('^2[nsm-selftest] VERDICT: %d/%d checks passed — client runtime verified in this environment^r'):format(pass, pass))
    elseif fail == 0 then
        print(('^3[nsm-selftest] VERDICT: %d passed, %d skipped, 0 failed — skipped checks need a real client (webview/CEF, real natives)^r'):format(pass, skip))
    else
        print(('^1[nsm-selftest] VERDICT: %d passed, %d FAILED, %d skipped — attach this console output to a bug report^r'):format(pass, fail, skip))
    end
end)

exports('GetLatestReport', function()
    return latestReport
end)
