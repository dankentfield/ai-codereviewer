defmodule App.Context do
  def hello(colour) do
    if colour == :red do
      IO.puts("Hello, red")
    else
      IO.puts("Hello, world!")
    end
  end
end
