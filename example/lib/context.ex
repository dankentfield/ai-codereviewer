defmodule App.Context do
  def hello(colour) do
    if colour == :red do
      IO.puts("Hello, red")
    else
      IO.puts("Hello, world!")
    end
  end

  def hello_world(colour) do
    if colour == :red do
      IO.puts("Hello, red")
    else
      IO.puts("Hello, world!")
    end
  end

  def hello_world(colour) do
    if colour == :red do
      IO.puts("Hello, red")
    else if colour == :blue do
      IO.puts("Hello, blue")
    else
      IO.puts("Hello, world!")
    end
  end
end
