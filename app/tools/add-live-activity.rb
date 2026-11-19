# Adds the files for the interactive widget and the Lock Screen's breathing session (a Live
# Activity) to the iOS project, once. It was run on November 17, 2026; it is kept so the change to
# the Xcode project can be read and repeated, and it does nothing for a file already there.
#
#   GEM_HOME=<CocoaPods' own gems> ruby tools/add-live-activity.rb     (from app/)
#
# It uses the `xcodeproj` library that CocoaPods brings, so the project file is never edited by
# hand. It sets no team and no signing identity: those stay a founder's to choose in Xcode.
require 'xcodeproj'

path = File.join(__dir__, '..', 'ios', 'App', 'App.xcodeproj')
project = Xcodeproj::Project.open(path)
app = project.targets.find { |t| t.name == 'App' } or abort('The App target is missing.')
widget = project.targets.find { |t| t.name == 'TidelightWidget' } or abort('The TidelightWidget target is missing.')
app_group = project.main_group['App'] or abort('The App group is missing.')
widget_group = project.main_group['TidelightWidget'] or abort('The TidelightWidget group is missing.')
changed = []

# What the Lock Screen is told (when the session ends): one file, part of both the app and the widget.
unless widget_group.files.any? { |f| f.path == 'BreathingAttributes.swift' }
  ref = widget_group.new_file('BreathingAttributes.swift')
  widget.add_file_references([ref])
  app.add_file_references([ref])
  changed << 'BreathingAttributes.swift (app and widget)'
end
# How it looks on the Lock Screen: the widget only.
unless widget_group.files.any? { |f| f.path == 'BreathingLive.swift' }
  widget.add_file_references([widget_group.new_file('BreathingLive.swift')])
  changed << 'BreathingLive.swift (widget)'
end
# Starting and ending it: the app only.
unless app_group.files.any? { |f| f.path == 'TidelightBreathing.swift' }
  app.add_file_references([app_group.new_file('TidelightBreathing.swift')])
  changed << 'TidelightBreathing.swift (app)'
end

if changed.empty?
  puts 'Everything is already in the project. Nothing changed.'
else
  project.save
  puts "Added: #{changed.join(', ')}."
end
