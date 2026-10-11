-- Cross-resource client export target for the client-demo acceptance test.
local notes = 0

exports('note', function(msg)
  notes = notes + 1
  return notes
end)

exports('getNotes', function()
  return notes
end)
